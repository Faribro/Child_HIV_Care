// components/ui/badge.tsx
import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({
  className = '',
  variant = 'primary',
  children,
  ...props
}) => {
  const baseStyle = 'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold select-none border transition-all';
  
  const variants = {
    primary: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    secondary: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    danger: 'bg-red-500/10 text-red-400 border-red-500/20',
    info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';
