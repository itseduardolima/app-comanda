export interface LoginResponse {
  operatorId: string;
  pinSet: boolean;
}

export interface AuthResponse {
  accessToken: string;
  operator: { id: string; name: string };
}
