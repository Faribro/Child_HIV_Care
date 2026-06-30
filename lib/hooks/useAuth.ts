// lib/hooks/useAuth.ts
import { useStore } from '@/lib/store';

/**
 * Custom hook providing simplified access to authentication states and actions.
 */
export function useAuth() {
  const user = useStore((s) => s.user);
  const authLoading = useStore((s) => s.authLoading);
  const login = useStore((s) => s.login);
  const logout = useStore((s) => s.logout);
  const signup = useStore((s) => s.signup);
  const checkSession = useStore((s) => s.checkSession);

  return {
    user,
    isLoading: authLoading,
    login,
    logout,
    signup,
    checkSession,
  };
}
export default useAuth;
