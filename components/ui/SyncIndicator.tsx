// components/ui/SyncIndicator.tsx
'use client';

import * as React from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useSync } from '@/lib/hooks/useSync';
import { formatDate } from '@/lib/utils/format';

export const SyncIndicator: React.FC = () => {
  const { syncStatus, queuedCount, lastSync } = useSync();

  const getStatusDetails = () => {
    if (syncStatus === 'syncing') {
      return {
        label: 'Syncing...',
        icon: <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />,
        colorClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        dotClass: 'bg-blue-400 animate-pulse',
      };
    }
    
    if (syncStatus === 'offline' || (typeof window !== 'undefined' && !navigator.onLine)) {
      if (queuedCount > 0) {
        return {
          label: `${queuedCount} Pending Changes`,
          icon: <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-bounce" />,
          colorClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          dotClass: 'bg-amber-400 animate-pulse',
        };
      }
      return {
        label: 'Offline ⚡',
        icon: <WifiOff className="w-3.5 h-3.5 text-zinc-400" />,
        colorClass: 'bg-zinc-800 text-zinc-400 border-zinc-700',
        dotClass: 'bg-zinc-500',
      };
    }

    return {
      label: 'Synced ✓',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
      colorClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      dotClass: 'bg-emerald-400',
    };
  };

  const details = getStatusDetails();

  return (
    <div className="flex items-center gap-2 select-none">
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${details.colorClass}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${details.dotClass}`} />
        {details.icon}
        <span>{details.label}</span>
      </div>
      {lastSync && (
        <span className="text-[10px] text-zinc-500 hidden sm:inline" title={new Date(lastSync).toISOString()}>
          Last sync: {formatDate(new Date(lastSync).toISOString())}
        </span>
      )}
    </div>
  );
};

SyncIndicator.displayName = 'SyncIndicator';
