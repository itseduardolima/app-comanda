import * as authApi from '../api/auth';
import { useAuthStore } from '../store/auth.store';
import { LoginResponse } from '../types/auth';

/** Screens read session state and auth actions only through this hook. */
export function useAuth() {
  const hydrated = useAuthStore((state) => state.hydrated);
  const token = useAuthStore((state) => state.token);
  const operator = useAuthStore((state) => state.operator);
  const completeLogin = useAuthStore((state) => state.completeLogin);
  const logout = useAuthStore((state) => state.logout);
  const hydrate = useAuthStore((state) => state.hydrate);

  /** Step 1 (screen 00): resolve username → { operatorId, pinSet }. */
  const login = (username: string): Promise<LoginResponse> => authApi.login(username);

  /** Screen 00A: create the PIN and open the session. */
  const createPin = async (operatorId: string, pin: string): Promise<void> => {
    const auth = await authApi.createPin(operatorId, pin);
    await completeLogin(auth);
  };

  /** Screen 00B: verify the PIN and open the session. */
  const verifyPin = async (operatorId: string, pin: string): Promise<void> => {
    const auth = await authApi.verifyPin(operatorId, pin);
    await completeLogin(auth);
  };

  return {
    hydrated,
    isAuthenticated: token !== null,
    operator,
    login,
    createPin,
    verifyPin,
    logout,
    hydrate,
  };
}
