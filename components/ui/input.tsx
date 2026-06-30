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

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, options, id, ...props }, ref) => {
    const selectId = id || Math.random().toString(36).substring(2, 9);
    
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold text-zinc-400 select-none">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`w-full bg-zinc-900 border text-white text-sm rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 placeholder-zinc-500 px-3.5 py-2.5 
            ${error ? 'border-red-500 focus:ring-red-500/50' : 'border-zinc-800 hover:border-zinc-700'} 
            disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-zinc-905 text-white">
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <span className="font-sans text-[11px] font-medium text-red-400 mt-0.5">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className = '', label, error, id, ...props }, ref) => {
    const textId = id || Math.random().toString(36).substring(2, 9);
    
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={textId} className="text-xs font-semibold text-zinc-400 select-none">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textId}
          rows={3}
          className={`w-full bg-zinc-900 border text-white text-sm rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 placeholder-zinc-500 px-3.5 py-2.5 
            ${error ? 'border-red-500 focus:ring-red-500/50' : 'border-zinc-800 hover:border-zinc-700'} 
            disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          {...props}
        />
        {error && (
          <span className="font-sans text-[11px] font-medium text-red-400 mt-0.5">
            {error}
          </span>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
