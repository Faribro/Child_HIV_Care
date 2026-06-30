// lib/hooks/useRecords.ts
import useSWR from 'swr';
import { fetchFromProxy } from '@/lib/api';
import { useStore } from '@/lib/store';
import { useEffect } from 'react';

/**
 * Hook to retrieve dashboard mapping records and statistics.
 * Automatically synchronizes responses with the global Zustand store and handles caching.
 */
export function useRecords() {
  const setRecordsAndStats = useStore((s) => s.setRecordsAndStats);
  const user = useStore((s) => s.user);

  const swr = useSWR(
    user ? 'getDashboardData' : null,
    async () => {
      const res = await fetchFromProxy('getDashboardData');
      if (res && res.success) {
        return res;
      }
      throw new Error(res?.error || 'Failed to fetch dashboard data');
    },
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      refreshInterval: 60000, // Poll every 1 minute
    }
  );

  useEffect(() => {
    if (swr.data && swr.data.success) {
      setRecordsAndStats(swr.data.records || [], swr.data.stats);
    }
  }, [swr.data, setRecordsAndStats]);

  return {
    data: swr.data,
    error: swr.error,
    isLoading: swr.isLoading,
    isValidating: swr.isValidating,
    mutate: swr.mutate,
  };
}
export default useRecords;
