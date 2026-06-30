// lib/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

/**
 * Hook to debounce a fast-changing value (e.g. search search query input).
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
export default useDebounce;
