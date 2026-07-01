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

    // Register/Unregister PWA service worker depending on env
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      if (process.env.NODE_ENV === 'development') {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister().then((success) => {
              if (success) console.log('[Dev] Unregistered active service worker to prevent developer caching.');
            });
          }
        });
      } else {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js').then(
            (reg) => console.log('PWA Service Worker registered with scope:', reg.scope),
            (err) => console.error('PWA Service Worker registration failed:', err)
          );
        });
      }
    }
  }, []);

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
