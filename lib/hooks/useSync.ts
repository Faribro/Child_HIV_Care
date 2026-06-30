// lib/hooks/useSync.ts
import { useEffect } from 'react';
import { useStore } from '@/lib/store';

/**
 * Custom hook that listens to browser connectivity changes, updates store state,
 * and triggers background synchronization of offline-queued operations upon reconnecting.
 */
export function useSync() {
  const syncStatus = useStore((s) => s.syncStatus);
  const queuedCount = useStore((s) => s.queuedCount);
  const lastSync = useStore((s) => s.lastSync);
  const syncOfflineQueue = useStore((s) => s.syncOfflineQueue);
  const loadDashboardData = useStore((s) => s.loadDashboardData);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = async () => {
      console.log('Device is back online. Replaying offline changes...');
      await syncOfflineQueue();
    };

    const handleOffline = () => {
      console.log('Device went offline. Writes will be cached locally.');
      // Refresh state from store to adjust indicators
      loadDashboardData();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check on load
    if (navigator.onLine) {
      syncOfflineQueue();
    } else {
      loadDashboardData();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncOfflineQueue, loadDashboardData]);

  return {
    syncStatus,
    queuedCount,
    lastSync,
    triggerSync: syncOfflineQueue,
  };
}
export default useSync;
