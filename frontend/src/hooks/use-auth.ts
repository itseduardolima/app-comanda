import { useAuthStore } from '../store/auth.store';

/** Screens read session state and auth actions only through this hook. */
export function useAuth() {
  const hydrated = useAuthStore((state) => state.hydrated);
  const token = useAuthStore((state) => state.token);
  const operator = useAuthStore((state) => state.operator);
  const completeLogin = useAuthStore((state) => state.completeLogin);
  const logout = useAuthStore((state) => state.logout);
  const hydrate = useAuthStore((state) => state.hydrate);

  return {
    hydrated,
    isAuthenticated: token !== null,
    operator,
    completeLogin,
    logout,
    hydrate,
  };
}
