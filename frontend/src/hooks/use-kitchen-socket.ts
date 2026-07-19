/**
 * Screens import hooks only (never src/ws directly); the implementation
 * lives in src/ws/use-kitchen-socket.ts next to the socket client it wraps.
 */
export { useKitchenSocket } from '../ws/use-kitchen-socket';
