// components/ui/KPICard.tsx
'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface KPICardProps {
  title: string;
  value: string | number;
  delta?: string | number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  delay?: number;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  delta,
  trend = 'neutral',
  icon: Icon,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay }}
      whileHover={{ y: -2 }}
      className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-5 shadow-lg relative overflow-hidden transition-colors hover:border-zinc-700/80 flex items-center justify-between"
    >
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-zinc-400 select-none uppercase tracking-wider">{title}</span>
        <span className="text-2xl font-bold font-mono tracking-tight text-zinc-100">{value}</span>
        
        {delta && (
          <div className="flex items-center gap-1 mt-0.5">
            {trend === 'up' && (
              <span className="flex items-center text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                {delta}
              </span>
            )}
            {trend === 'down' && (
              <span className="flex items-center text-[11px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                {delta}
              </span>
            )}
            {trend === 'neutral' && (
              <span className="text-[11px] font-medium text-zinc-500">
                {delta}
              </span>
            )}
          </div>
        )}
      </div>

      {Icon && (
        <div className="p-3 bg-zinc-800/50 border border-zinc-850 rounded-xl text-zinc-300 flex items-center justify-center">
          {Icon}
        </div>
      )}
    </motion.div>
  );
};

KPICard.displayName = 'KPICard';
