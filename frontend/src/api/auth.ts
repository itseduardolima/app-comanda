import { AuthResponse, LoginResponse } from '../types/auth';
import { request } from './client';

export function login(username: string): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { username },
    anonymous: true,
  });
}

export function createPin(operatorId: string, pin: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/pin/create', {
    method: 'POST',
    body: { operatorId, pin },
    anonymous: true,
  });
}

export function verifyPin(operatorId: string, pin: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/pin/verify', {
    method: 'POST',
    body: { operatorId, pin },
    anonymous: true,
  });
}
