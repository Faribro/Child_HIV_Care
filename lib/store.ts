// lib/store.ts
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { User, Patient, DashboardStats, SyncStatus, SyncQueueItem } from '@/types';
import { fetchFromProxy, getClientSession } from './api';
import { cacheDashboardData, getCachedDashboardData, addToOfflineQueue, getOfflineQueue, removeFromOfflineQueue } from './utils/db';

interface AuthSlice {
  user: User | null;
  authLoading: boolean;
  setUser: (user: User | null) => void;
  checkSession: () => Promise<User | null>;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string, role: string) => Promise<{ success: boolean; message?: string; error?: string }>;
}

interface DataSlice {
  records: Patient[];
  filteredRecords: Patient[];
  stats: DashboardStats | null;
  activeTab: string;
  searchQuery: string;
  stateFilter: string;
  syncStatus: SyncStatus;
  lastSync: number | null;
  queuedCount: number;
  dataLoading: boolean;
  dataError: string | null;
  
  setRecordsAndStats: (records: Patient[], stats: DashboardStats) => void;
  setActiveTab: (tab: string) => void;
  setSearchQuery: (query: string) => void;
  setStateFilter: (state: string) => void;
  loadDashboardData: (forceRefresh?: boolean) => Promise<void>;
  applyFilters: () => void;
  
  // CRUD Actions (Optimistic + Offline Queue support)
  addRecord: (record: Omit<Patient, '_uuid'>) => Promise<void>;
  updateRecord: (uuid: string, updates: Partial<Patient>) => Promise<void>;
  deleteRecord: (uuid: string) => Promise<void>;
  syncOfflineQueue: () => Promise<void>;
}

interface ThemeSlice {
  theme: 'classic' | 'dark' | 'emerald';
  setTheme: (theme: 'classic' | 'dark' | 'emerald') => void;
}

export const useStore = create<AuthSlice & DataSlice & ThemeSlice>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // --- AUTHENTICATION STATE ---
      user: null,
      authLoading: true,
      
      setUser: (user) => set({ user }),
      
      checkSession: async () => {
        set({ authLoading: true });
        try {
          const user = await getClientSession();
          set({ user, authLoading: false });
          return user;
        } catch {
          set({ user: null, authLoading: false });
          return null;
        }
      },
      
      login: async (email, password, rememberMe) => {
        set({ authLoading: true });
        try {
          const res = await fetchFromProxy<{ success: boolean; user?: User; error?: string }>('loginUser', [email, password], { rememberMe });
          if (res.success && res.user) {
            set({ user: res.user, authLoading: false });
            // Load dashboard data immediately after login
            get().loadDashboardData();
            return { success: true };
          }
          set({ authLoading: false });
          return { success: false, error: res.error || 'Login failed' };
        } catch (err: any) {
          set({ authLoading: false });
          return { success: false, error: err.message || 'Login request failed' };
        }
      },
      
      logout: async () => {
        set({ authLoading: true });
        try {
          await fetchFromProxy('logoutUser');
        } catch (err) {
          console.error('Logout request error:', err);
        } finally {
          set({ user: null, authLoading: false, records: [], filteredRecords: [], stats: null });
        }
      },
      
      signup: async (email, password, name, role) => {
        try {
          const res = await fetchFromProxy<{ success: boolean; message?: string; error?: string }>('signupUser', [email, password, name, role]);
          return res;
        } catch (err: any) {
          return { success: false, error: err.message || 'Signup request failed' };
        }
      },

      // --- DATA & OPERATIONS STATE ---
      records: [],
      filteredRecords: [],
      stats: null,
      activeTab: 'overview',
      searchQuery: '',
      stateFilter: 'All States',
      syncStatus: 'idle',
      lastSync: null,
      queuedCount: 0,
      dataLoading: false,
      dataError: null,
      
      setRecordsAndStats: (records, stats) => {
        set({ records, filteredRecords: records, stats, lastSync: Date.now() });
        get().applyFilters();
        cacheDashboardData(records, stats);
      },
      
      setActiveTab: (activeTab) => set({ activeTab }),
      
      setSearchQuery: (searchQuery) => {
        set({ searchQuery });
        get().applyFilters();
      },
      
      setStateFilter: (stateFilter) => {
        set({ stateFilter });
        get().applyFilters();
      },
      
      loadDashboardData: async (forceRefresh = false) => {
        // Hydrate queuedCount first
        const offlineQueue = await getOfflineQueue();
        set({ queuedCount: offlineQueue.length });

        // If offline, try hydrating from cache
        if (typeof window !== 'undefined' && !navigator.onLine) {
          set({ syncStatus: 'offline' });
          const cached = await getCachedDashboardData();
          if (cached) {
            set({
              records: cached.records,
              filteredRecords: cached.records,
              stats: cached.stats,
              lastSync: cached.timestamp,
              dataLoading: false
            });
            get().applyFilters();
          }
          return;
        }

        set({ dataLoading: true, dataError: null });
        try {
          const res = await fetchFromProxy('getDashboardData');
          if (res && res.success) {
            set({
              records: res.records || [],
              stats: res.stats || null,
              lastSync: Date.now(),
              syncStatus: 'idle',
              dataLoading: false,
            });
            get().applyFilters();
            await cacheDashboardData(res.records || [], res.stats || null);
          } else {
            throw new Error(res?.error || 'Failed to fetch dashboard data');
          }
        } catch (err: any) {
          console.error('Load dashboard error:', err);
          // Fallback to cache if network fails
          const cached = await getCachedDashboardData();
          if (cached) {
            set({
              records: cached.records,
              filteredRecords: cached.records,
              stats: cached.stats,
              lastSync: cached.timestamp,
              syncStatus: 'offline',
              dataError: 'Running offline fallback. Sync failed.',
              dataLoading: false
            });
            get().applyFilters();
          } else {
            set({ dataLoading: false, dataError: err.message });
          }
        }
      },
      
      applyFilters: () => {
        const { records, searchQuery, stateFilter, user } = get();
        let filtered = [...records];
        
        // Apply RBAC: Regular data entry users only see their own submitted entries.
        // Admin / SuperAdmin / Viewer / Editor see ALL records.
        const canSeeAll = !user || ['Admin', 'SuperAdmin', 'Viewer', 'Editor'].includes(user.role);
        if (!canSeeAll) {
          filtered = filtered.filter(r => r._submitted_by && r._submitted_by.toLowerCase() === user!.email.toLowerCase());
        }
        
        // Apply State filter
        if (stateFilter && stateFilter !== 'All States') {
          filtered = filtered.filter(r => r.addressstate && r.addressstate.toLowerCase() === stateFilter.toLowerCase());
        }
        
        // Apply Search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          filtered = filtered.filter(r => 
            (r.childname && r.childname.toLowerCase().includes(query)) ||
            (r.caregivername && r.caregivername.toLowerCase().includes(query)) ||
            (r.addressdistrict && r.addressdistrict.toLowerCase().includes(query)) ||
            (r.addressstate && r.addressstate.toLowerCase().includes(query))
          );
        }
        
        set({ filteredRecords: filtered });
      },

      // --- OPTIMISTIC CRUD ACTIONS & OFFLINE QUEUEING ---
      addRecord: async (newRecordPayload) => {
        const uuid = crypto.randomUUID();
        const recordWithUuid: Patient = {
          ...newRecordPayload,
          _uuid: uuid,
          _submission_time: new Date().toISOString(),
          _submitted_by: get().user?.email || 'Offline User',
          __sync_needed: 'Yes',
          __last_updated: new Date().toISOString()
        };

        // 1. Optimistic Update in UI
        const updatedRecords = [recordWithUuid, ...get().records];
        set({
          records: updatedRecords,
          queuedCount: get().queuedCount + (navigator.onLine ? 0 : 1)
        });
        get().applyFilters();

        if (typeof window !== 'undefined' && !navigator.onLine) {
          // 2. Offline: Queue in IndexedDB
          set({ syncStatus: 'offline' });
          await addToOfflineQueue({
            id: uuid,
            action: 'ADD_RECORD',
            payload: recordWithUuid,
            timestamp: Date.now()
          });
          return;
        }

        // 3. Online: Write directly
        set({ syncStatus: 'syncing' });
        try {
          const res = await fetchFromProxy('editRecord', [uuid, recordWithUuid]);
          if (res.success) {
            set({ syncStatus: 'idle' });
            get().loadDashboardData(); // Refresh clean state
          } else {
            throw new Error(res.error || 'Server rejected write');
          }
        } catch (err) {
          console.error('Failed to sync added record. Queueing for retry.', err);
          set({ syncStatus: 'offline' });
          await addToOfflineQueue({
            id: uuid,
            action: 'ADD_RECORD',
            payload: recordWithUuid,
            timestamp: Date.now()
          });
          set({ queuedCount: get().queuedCount + 1 });
        }
      },

      updateRecord: async (uuid, updates) => {
        // 1. Optimistic Update in UI
        const updatedRecords = get().records.map(r => {
          if (r._uuid === uuid) {
            return {
              ...r,
              ...updates,
              __sync_needed: 'Yes',
              __last_updated: new Date().toISOString()
            };
          }
          return r;
        });

        set({
          records: updatedRecords,
          queuedCount: get().queuedCount + (navigator.onLine ? 0 : 1)
        });
        get().applyFilters();

        const targetRecord = updatedRecords.find(r => r._uuid === uuid);

        if (typeof window !== 'undefined' && !navigator.onLine) {
          // 2. Offline: Queue in IndexedDB
          set({ syncStatus: 'offline' });
          await addToOfflineQueue({
            id: uuid,
            action: 'UPDATE_RECORD',
            payload: targetRecord ?? {},
            timestamp: Date.now()
          });
          return;
        }

        // 3. Online: Write directly
        set({ syncStatus: 'syncing' });
        try {
          const res = await fetchFromProxy('editRecord', [uuid, targetRecord]);
          if (res.success) {
            set({ syncStatus: 'idle' });
            get().loadDashboardData();
          } else {
            throw new Error(res.error || 'Server rejected update');
          }
        } catch (err) {
          console.error('Failed to sync updated record. Queueing for retry.', err);
          set({ syncStatus: 'offline' });
          await addToOfflineQueue({
            id: uuid,
            action: 'UPDATE_RECORD',
            payload: targetRecord ?? {},
            timestamp: Date.now()
          });
          set({ queuedCount: get().queuedCount + 1 });
        }
      },

      deleteRecord: async (uuid) => {
        // 1. Optimistic Delete in UI
        const updatedRecords = get().records.filter(r => r._uuid !== uuid);
        
        set({
          records: updatedRecords,
          queuedCount: get().queuedCount + (navigator.onLine ? 0 : 1)
        });
        get().applyFilters();

        if (typeof window !== 'undefined' && !navigator.onLine) {
          // 2. Offline: Queue in IndexedDB
          set({ syncStatus: 'offline' });
          await addToOfflineQueue({
            id: uuid,
            action: 'DELETE_RECORD',
            payload: { uuid },
            timestamp: Date.now()
          });
          return;
        }

        // 3. Online: Write directly
        set({ syncStatus: 'syncing' });
        try {
          const res = await fetchFromProxy('deleteRecord', [uuid]);
          if (res.success) {
            set({ syncStatus: 'idle' });
            get().loadDashboardData();
          } else {
            throw new Error(res.error || 'Server rejected deletion');
          }
        } catch (err) {
          console.error('Failed to sync delete record. Queueing for retry.', err);
          set({ syncStatus: 'offline' });
          await addToOfflineQueue({
            id: uuid,
            action: 'DELETE_RECORD',
            payload: { uuid },
            timestamp: Date.now()
          });
          set({ queuedCount: get().queuedCount + 1 });
        }
      },

      syncOfflineQueue: async () => {
        if (typeof window !== 'undefined' && !navigator.onLine) return;
        const queue = await getOfflineQueue();
        if (queue.length === 0) return;

        set({ syncStatus: 'syncing' });
        try {
          for (const item of queue) {
            if (item.action === 'ADD_RECORD' || item.action === 'UPDATE_RECORD') {
              await fetchFromProxy('editRecord', [item.id, item.payload]);
            } else if (item.action === 'DELETE_RECORD') {
              await fetchFromProxy('deleteRecord', [item.id]);
            }
            await removeFromOfflineQueue(item.id);
          }
          
          set({ queuedCount: 0, syncStatus: 'idle' });
          get().loadDashboardData(); // Hydrate clean state
        } catch (err) {
          console.error('Background sync failed partially:', err);
          const remaining = await getOfflineQueue();
          set({ queuedCount: remaining.length, syncStatus: 'offline' });
        }
      },

      // --- THEME STATE ---
      theme: 'dark',
      setTheme: (theme) => {
        set({ theme });
        if (typeof window !== 'undefined') {
          localStorage.setItem('childcare_dashboard_theme', theme);
          document.body.classList.remove('theme-classic', 'theme-dark', 'theme-emerald');
          document.body.classList.add(`theme-${theme}`);
        }
      }
    })),
    { name: 'Childcare-Store' }
  )
);
