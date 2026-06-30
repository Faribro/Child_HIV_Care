// lib/utils/db.ts
import { SyncQueueItem, Patient, DashboardStats } from '@/types';

const DB_NAME = 'MPAC_Offline_DB';
const DB_VERSION = 1;

/**
 * Open the local IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('queue')) {
        db.createObjectStore('queue', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save dashboard data cache to IndexedDB
 */
export async function cacheDashboardData(records: Patient[], stats: DashboardStats): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('cache', 'readwrite');
    const store = tx.objectStore('cache');
    store.put({
      key: 'dashboard_data',
      records,
      stats,
      timestamp: Date.now(),
    });
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to cache dashboard data in IndexedDB:', err);
  }
}

/**
 * Retrieve cached dashboard data from IndexedDB
 */
export async function getCachedDashboardData(): Promise<{ records: Patient[]; stats: DashboardStats; timestamp: number } | null> {
  try {
    const db = await openDB();
    const tx = db.transaction('cache', 'readonly');
    const store = tx.objectStore('cache');
    const request = store.get('dashboard_data');
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to read dashboard cache from IndexedDB:', err);
    return null;
  }
}

/**
 * Add a write operation (add/update/delete) to the offline queue
 */
export async function addToOfflineQueue(item: SyncQueueItem): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('queue', 'readwrite');
    const store = tx.objectStore('queue');
    store.put(item);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to add write action to offline queue:', err);
  }
}

/**
 * Get all queued offline operations ordered by timestamp
 */
export async function getOfflineQueue(): Promise<SyncQueueItem[]> {
  try {
    const db = await openDB();
    const tx = db.transaction('queue', 'readonly');
    const store = tx.objectStore('queue');
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const items = request.result || [];
        items.sort((a, b) => a.timestamp - b.timestamp);
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to retrieve offline queue:', err);
    return [];
  }
}

/**
 * Remove an operation from the offline queue
 */
export async function removeFromOfflineQueue(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('queue', 'readwrite');
    const store = tx.objectStore('queue');
    store.delete(id);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to delete offline queue item:', err);
  }
}

/**
 * Clear the entire offline queue
 */
export async function clearOfflineQueue(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('queue', 'readwrite');
    const store = tx.objectStore('queue');
    store.clear();
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to clear offline queue:', err);
  }
}
