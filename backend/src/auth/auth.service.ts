import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Operator } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { JwtPayload } from '../common/types/authenticated-operator';
import { PrismaService } from '../prisma/prisma.service';

const PIN_SALT_ROUNDS = 10;

export interface LoginResult {
  operatorId: string;
  pinSet: boolean;
}

export interface AuthResult {
  accessToken: string;
  operator: { id: string; name: string };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /** Step 1 of the flow: resolves a username and tells whether a PIN exists. */
  async login(username: string): Promise<LoginResult> {
    const operator = await this.prisma.operator.findUnique({ where: { username } });
    if (!operator) {
      throw new NotFoundException('Operator not found');
    }
    return { operatorId: operator.id, pinSet: operator.pinSet };
  }

  /** First access: sets the 4-digit PIN (stored as bcrypt hash) and signs a JWT. */
  async createPin(operatorId: string, pin: string): Promise<AuthResult> {
    const operator = await this.prisma.operator.findUnique({ where: { id: operatorId } });
    if (!operator) {
      throw new NotFoundException('Operator not found');
    }
    if (operator.pinSet) {
      throw new ConflictException('PIN already set for this operator');
    }
    const pinHash = await bcrypt.hash(pin, PIN_SALT_ROUNDS);
    const updated = await this.prisma.operator.update({
      where: { id: operatorId },
      data: { pinHash, pinSet: true },
    });
    return this.buildAuthResult(updated);
  }

  /**
   * Subsequent accesses: verifies the PIN against the stored hash.
   * Returns a generic 401 for unknown operator OR wrong PIN, so responses
   * cannot be used to enumerate operators.
   *
   * NOTE: lockout after N failed attempts is a known open point
   * (.specs/00-contexto-projeto.md § Riscos) and is intentionally not
   * implemented in this iteration.
   */
  async verifyPin(operatorId: string, pin: string): Promise<AuthResult> {
    const operator = await this.prisma.operator.findUnique({ where: { id: operatorId } });
    if (!operator || !operator.pinSet || !operator.pinHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const matches = await bcrypt.compare(pin, operator.pinHash);
    if (!matches) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.buildAuthResult(operator);
  }

  private buildAuthResult(operator: Operator): AuthResult {
    const payload: JwtPayload = {
      sub: operator.id,
      username: operator.username,
      name: operator.name,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      operator: { id: operator.id, name: operator.name },
    };
  }
}
