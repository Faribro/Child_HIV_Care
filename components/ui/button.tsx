// components/ui/button.tsx
import * as React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyle = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer';
    
    const variants = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-md shadow-blue-500/10',
      secondary: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 focus:ring-zinc-500',
      ghost: 'bg-transparent hover:bg-zinc-800 text-zinc-300 hover:text-white focus:ring-zinc-500',
      danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-md shadow-red-500/10',
      success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-md shadow-emerald-500/10',
    };
    
    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
