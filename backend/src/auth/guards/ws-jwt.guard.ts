import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthenticatedOperator, JwtPayload } from '../../common/types/authenticated-operator';

interface AuthenticatedSocket extends Socket {
  data: { operator?: AuthenticatedOperator };
}

/**
 * Validates the same REST JWT on WebSocket messages. The handshake itself is
 * validated in KitchenGateway.handleConnection (guards do not run there);
 * this guard re-checks on every subscribed message as defense in depth.
 */
@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<AuthenticatedSocket>();
    const operator = client.data.operator ?? this.verifyClient(client);
    if (!operator) {
      throw new WsException('Unauthorized');
    }
    client.data.operator = operator;
    return true;
  }

  /** Extracts and verifies the JWT from the socket handshake; null if invalid. */
  verifyClient(client: Socket): AuthenticatedOperator | null {
    const token = this.extractToken(client);
    if (!token) {
      return null;
    }
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      return { id: payload.sub, username: payload.username, name: payload.name };
    } catch {
      return null;
    }
  }

  private extractToken(client: Socket): string | null {
    const auth = client.handshake.auth as Record<string, unknown>;
    if (typeof auth?.token === 'string') {
      return auth.token;
    }
    const header = client.handshake.headers.authorization;
    if (typeof header === 'string' && header.startsWith('Bearer ')) {
      return header.slice('Bearer '.length);
    }
    return null;
  }
}
