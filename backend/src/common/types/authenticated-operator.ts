/** Operator injected into `request.user` by the JWT strategy. */
export interface AuthenticatedOperator {
  id: string;
  username: string;
  name: string;
}

/** Payload signed into the JWT access token. */
export interface JwtPayload {
  sub: string;
  username: string;
  name: string;
}
