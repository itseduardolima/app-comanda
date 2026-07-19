/**
 * Error types shared across layers. They live in types/ (not api/) so screens
 * can narrow errors without importing src/api directly — screens only import
 * hooks and types (frontend/.specs/02-organizacao-pastas.md § Regras).
 */

export class ApiError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Thrown when the request never reached the server (offline, timeout…). */
export class NetworkError extends Error {
  constructor(cause?: unknown) {
    super('Network request failed');
    this.name = 'NetworkError';
    this.cause = cause;
  }
}
