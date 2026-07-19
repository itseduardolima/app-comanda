import Constants from 'expo-constants';
import { ApiError, NetworkError } from '../types/errors';

/**
 * Base HTTP client. Reads the API URL from app.json `extra.apiUrl` (EAS env
 * in production builds). Holds the session token via setter injection so the
 * auth store can configure it without an import cycle.
 */

const extra = (Constants.expoConfig?.extra ?? {}) as { apiUrl?: string };
export const API_URL = extra.apiUrl ?? 'http://localhost:3000/api';

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

/** Registered by the auth store: 401 anywhere clears the session (HU-18). */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

export { ApiError, NetworkError };

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Skip the Authorization header (auth endpoints). */
  anonymous?: boolean;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (!options.anonymous && authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch (error) {
    throw new NetworkError(error);
  }

  if (response.status === 401 && !options.anonymous) {
    onUnauthorized?.();
  }

  if (!response.ok) {
    let message = response.statusText;
    try {
      const payload = (await response.json()) as { message?: string | string[] };
      if (payload.message) {
        message = Array.isArray(payload.message) ? payload.message.join(', ') : payload.message;
      }
    } catch {
      // keep statusText
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}
