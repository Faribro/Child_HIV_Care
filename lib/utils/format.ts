// lib/utils/format.ts

/**
 * Format a ISO date string into a clean, human-readable format.
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'N/A';
    
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  } catch {
    return 'N/A';
  }
}

/**
 * Format a number with Indian format separators (thousands/lakhs).
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
}

/**
 * Format a fraction or decimal into a clean percentage.
 */
export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return `${Math.round(value * 100)}%`;
}
