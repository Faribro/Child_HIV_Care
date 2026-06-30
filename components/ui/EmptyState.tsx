// components/ui/EmptyState.tsx
import * as React from 'react';
import { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/30 max-w-md mx-auto my-8">
      {Icon && (
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 mb-4 flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-base font-semibold text-zinc-200 mb-1">{title}</h3>
      <p className="text-xs text-zinc-400 max-w-sm mb-5 leading-relaxed">{description}</p>
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
};

EmptyState.displayName = 'EmptyState';
