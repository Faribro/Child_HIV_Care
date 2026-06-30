// components/ui/Toast.tsx
'use client';

import * as React from 'react';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: (item: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  toasts: ToastItem[];
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(({ type, title, message, duration = 4000 }: Omit<ToastItem, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toast, removeToast, toasts }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastContainer: React.FC<{ toasts: ToastItem[]; removeToast: (id: string) => void }> = ({
  toasts,
  removeToast,
}) => {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastCard: React.FC<{ toast: ToastItem; onClose: (id: string) => void }> = ({
  toast,
  onClose,
}) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    info: <Info className="w-5 h-5 text-cyan-400" />,
  };

  const borders = {
    success: 'border-emerald-500/20 bg-zinc-950/90 text-zinc-100',
    error: 'border-red-500/20 bg-zinc-950/90 text-zinc-100',
    warning: 'border-amber-500/20 bg-zinc-950/90 text-zinc-100',
    info: 'border-cyan-500/20 bg-zinc-950/90 text-zinc-100',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className={`pointer-events-auto flex gap-3 w-full border rounded-xl p-4 shadow-xl backdrop-blur-md select-none ${borders[toast.type]}`}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-grow flex flex-col gap-0.5">
        {toast.title && <h4 className="text-sm font-semibold">{toast.title}</h4>}
        <p className="text-xs text-zinc-300 leading-normal">{toast.message}</p>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 self-start p-0.5 text-zinc-500 hover:text-zinc-300 rounded transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
