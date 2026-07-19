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

interface SessionStorage {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

/**
 * JWT lives in the device secure storage (expo-secure-store), never plain
 * AsyncStorage (HU-18).
 *
 * `expo-secure-store` has no web implementation, so the web target falls back
 * to `localStorage` — enough to survive a page reload while developing. It is
 * deliberately weaker than the native path (any XSS on the page can read it),
 * which is acceptable only because web is a dev/preview target: the shipped
 * app is Android/iOS. Do not promote web to production without replacing this
 * with an httpOnly cookie issued by the API.
 */
async function sessionStorage(): Promise<SessionStorage> {
  if (Platform.OS === 'web') {
    return {
      get: (key) => Promise.resolve(globalThis.localStorage?.getItem(key) ?? null),
      set: (key, value) => Promise.resolve(globalThis.localStorage?.setItem(key, value)),
      remove: (key) => Promise.resolve(globalThis.localStorage?.removeItem(key)),
    };
  }
  const secure = await import('expo-secure-store');
  return {
    get: (key) => secure.getItemAsync(key),
    set: (key, value) => secure.setItemAsync(key, value),
    remove: (key) => secure.deleteItemAsync(key),
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  hydrated: false,
  token: null,
  operator: null,

  async hydrate() {
    try {
      const store = await sessionStorage();
      const [token, operatorJson] = await Promise.all([
        store.get(TOKEN_KEY),
        store.get(OPERATOR_KEY),
      ]);
      if (token && operatorJson) {
        setAuthToken(token);
        connectSocket(token);
        set({ token, operator: JSON.parse(operatorJson) as OperatorSession });
      }
    } finally {
      set({ hydrated: true });
    }
  },

  async completeLogin(auth) {
    setAuthToken(auth.accessToken);
    connectSocket(auth.accessToken);
    set({ token: auth.accessToken, operator: auth.operator });
    const store = await sessionStorage();
    await Promise.all([
      store.set(TOKEN_KEY, auth.accessToken),
      store.set(OPERATOR_KEY, JSON.stringify(auth.operator)),
    ]);
  },

  async logout() {
    disconnectSocket();
    setAuthToken(null);
    set({ token: null, operator: null });
    const store = await sessionStorage();
    await Promise.all([store.remove(TOKEN_KEY), store.remove(OPERATOR_KEY)]);
  },
}));

// Any 401 from the API clears the local session and sends the operator back
// to Login (root layout reacts to token = null) — HU-18.
setUnauthorizedHandler(() => {
  void useAuthStore.getState().logout();
});
