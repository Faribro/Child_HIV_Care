// app/providers.tsx
'use client';

import * as React from 'react';
import { SWRConfig } from 'swr';
import { ToastProvider } from '@/components/ui/Toast';
import { useStore } from '@/lib/store';

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const checkSession = useStore((s) => s.checkSession);

  React.useEffect(() => {
    // Hydrate current active session on mount
    checkSession();

    // Register PWA service worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (reg) => console.log('PWA Service Worker registered with scope:', reg.scope),
          (err) => console.error('PWA Service Worker registration failed:', err)
        );
      });
    }
  }, [checkSession]);

  return (
    <SWRConfig
      value={{
        dedupingInterval: 5000,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        errorRetryCount: 3,
      }}
    >
      <ToastProvider>{children}</ToastProvider>
    </SWRConfig>
  );
};

export default Providers;
