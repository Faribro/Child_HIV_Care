// lib/utils/fuzzy.ts

/**
 * Calculates the Levenshtein distance between two strings.
 */
export function LevenshteinDistance(s1: string, s2: string): number {
  const a = s1.toLowerCase().trim();
  const b = s2.toLowerCase().trim();
  
  const costs: number[] = [];
  for (let i = 0; i <= a.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= b.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (a.charAt(i - 1) !== b.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) {
      costs[b.length] = lastValue;
    }
  }
  return costs[b.length];
}

/**
 * Calculates a similarity ratio between 0 and 1 (where 1 is identical) based on Levenshtein distance.
 */
export function stringSimilarity(s1: string, s2: string): number {
  const maxLength = Math.max(s1.length, s2.length);
  if (maxLength === 0) return 1.0;
  
  const distance = LevenshteinDistance(s1, s2);
  return (maxLength - distance) / maxLength;
}
