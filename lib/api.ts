// lib/api.ts

/**
 * Custom application error class
 */
export class ApiError extends Error {
  status?: number;
  code?: string;
  
  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

interface FetchOptions {
  retries?: number;
  delay?: number;
  signal?: AbortSignal;
  rememberMe?: boolean;
}

/**
 * Fetch helper for communicating with Vercel serverless proxy endpoint /api/proxy.
 * Automatically handles retries and formats standard errors.
 */
export async function fetchFromProxy<T = any>(
  functionName: string,
  args: any[] = [],
  options: FetchOptions = {}
): Promise<T> {
  const { retries = 2, delay = 1000, signal, rememberMe } = options;
  
  const executeFetch = async (attempt: number): Promise<T> => {
    try {
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          functionName,
          arguments: args,
          rememberMe,
        }),
        signal,
      });

      // Handle HTTP errors
      if (!response.ok) {
        let errMsg = `Server returned status ${response.status}`;
        try {
          const errBody = await response.json();
          if (errBody && errBody.error) errMsg = errBody.error;
        } catch {
          // Ignored if JSON parsing fails
        }
        
        throw new ApiError(errMsg, response.status);
      }

      const data = await response.json();
      
      // Handle business logic errors from Apps Script
      if (data && data.success === false) {
        throw new ApiError(data.error || 'Operation failed', 200, 'BUSINESS_ERROR');
      }

      return data as T;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw err;
      }

      // Retry mechanism for network drops
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt)));
        return executeFetch(attempt + 1);
      }
      
      throw err instanceof ApiError ? err : new ApiError(err.message || 'Network request failed');
    }
  };

  return executeFetch(0);
}

/**
 * Get the current authenticated user session if one exists
 */
export async function getClientSession(): Promise<any> {
  const res = await fetch('/api/proxy', { method: 'GET' });
  if (!res.ok) return null;
  const data = await res.json();
  return data.success ? data.user : null;
}
