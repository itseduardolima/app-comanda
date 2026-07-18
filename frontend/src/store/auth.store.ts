import { Platform } from 'react-native';
import { create } from 'zustand';
import { setAuthToken, setUnauthorizedHandler } from '../api/client';
import { AuthResponse } from '../types/auth';
import { connectSocket, disconnectSocket } from '../ws/client';

const TOKEN_KEY = 'auth.token';
const OPERATOR_KEY = 'auth.operator';

interface OperatorSession {
  id: string;
  name: string;
}

interface AuthState {
  hydrated: boolean;
  token: string | null;
  operator: OperatorSession | null;
  hydrate(): Promise<void>;
  /** Called by pin-create / pin-verify with the API auth payload (HU-18). */
  completeLogin(auth: AuthResponse): Promise<void>;
  logout(): Promise<void>;
}

/**
 * JWT lives in the device secure storage (expo-secure-store), never plain
 * AsyncStorage (HU-18). SecureStore is unavailable on web — there the
 * session is memory-only, which is fine for the dev/preview web target.
 */
async function secureStore(): Promise<typeof import('expo-secure-store') | null> {
  if (Platform.OS === 'web') {
    return null;
  }
  return import('expo-secure-store');
}

export const useAuthStore = create<AuthState>((set, get) => ({
  hydrated: false,
  token: null,
  operator: null,

  async hydrate() {
    try {
      const store = await secureStore();
      if (store) {
        const [token, operatorJson] = await Promise.all([
          store.getItemAsync(TOKEN_KEY),
          store.getItemAsync(OPERATOR_KEY),
        ]);
        if (token && operatorJson) {
          setAuthToken(token);
          connectSocket(token);
          set({ token, operator: JSON.parse(operatorJson) as OperatorSession });
        }
      }
    } finally {
      set({ hydrated: true });
    }
  },

  async completeLogin(auth) {
    setAuthToken(auth.accessToken);
    connectSocket(auth.accessToken);
    set({ token: auth.accessToken, operator: auth.operator });
    const store = await secureStore();
    if (store) {
      await Promise.all([
        store.setItemAsync(TOKEN_KEY, auth.accessToken),
        store.setItemAsync(OPERATOR_KEY, JSON.stringify(auth.operator)),
      ]);
    }
  },

  async logout() {
    disconnectSocket();
    setAuthToken(null);
    set({ token: null, operator: null });
    const store = await secureStore();
    if (store) {
      await Promise.all([
        store.deleteItemAsync(TOKEN_KEY),
        store.deleteItemAsync(OPERATOR_KEY),
      ]);
    }
  },
}));

// Any 401 from the API clears the local session and sends the operator back
// to Login (root layout reacts to token = null) — HU-18.
setUnauthorizedHandler(() => {
  void useAuthStore.getState().logout();
});
