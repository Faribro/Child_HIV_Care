// components/pwa/OfflineBanner.tsx
'use client';

import * as React from 'react';
import { WifiOff, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    updateStatus();

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.3 }}
          className="bg-amber-600 border-b border-amber-700 text-white py-2 px-4 text-center text-xs font-semibold flex items-center justify-center gap-2 select-none shadow-md z-[9999] relative"
        >
          <WifiOff className="w-4 h-4 animate-pulse" />
          <span>Offline mode active. Operations will be saved locally and synced automatically when connection is restored.</span>
          <AlertTriangle className="w-3.5 h-3.5 opacity-80" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

OfflineBanner.displayName = 'OfflineBanner';
export default OfflineBanner;
