// components/ui/input.tsx
import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, prefixIcon, suffixIcon, type = 'text', id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-zinc-400 select-none">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefixIcon && (
            <div className="absolute left-3 text-zinc-500 pointer-events-none flex items-center justify-center">
              {prefixIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            type={type}
            className={`w-full bg-zinc-900 border text-white text-sm rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 placeholder-zinc-500
              ${prefixIcon ? 'pl-10' : 'pl-3.5'} 
              ${suffixIcon ? 'pr-10' : 'pr-3.5'} 
              py-2.5 
              ${error ? 'border-red-500 focus:ring-red-500/50' : 'border-zinc-800 hover:border-zinc-700'} 
              disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            {...props}
          />
          {suffixIcon && (
            <div className="absolute right-3 text-zinc-500 pointer-events-none flex items-center justify-center">
              {suffixIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs font-medium text-red-400 mt-0.5">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-zinc-500 mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
