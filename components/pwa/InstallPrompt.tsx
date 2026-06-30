// components/pwa/InstallPrompt.tsx
'use client';

import * as React from 'react';
import { Download, X, AppWindow } from 'lucide-react';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show if the PWA is not already installed or prompt wasn't dismissed
      const isDismissed = localStorage.getItem('pwa-prompt-dismissed') === 'true';
      if (!isDismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA installation choice: ${outcome}`);
    
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-prompt-dismissed', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          className="fixed bottom-4 left-4 z-[99] bg-zinc-950/90 border border-zinc-800 rounded-xl p-4 shadow-2xl max-w-sm w-full backdrop-blur-md text-white select-none flex flex-col gap-3"
        >
          <div className="flex items-start justify-between">
            <div className="flex gap-2.5 items-center">
              <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg">
                <AppWindow className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <h4 className="text-sm font-semibold">Install Dashboard App</h4>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  Add to home screen for offline access and native-like performance.
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 text-zinc-500 hover:text-zinc-300 rounded transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 mt-1 justify-end">
            <Button variant="ghost" size="sm" onClick={handleDismiss}>
              Not Now
            </Button>
            <Button variant="primary" size="sm" onClick={handleInstallClick}>
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Install
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

InstallPrompt.displayName = 'InstallPrompt';
export default InstallPrompt;
