import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Operator } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  const prismaMock = {
    operator: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
  };

  const jwtServiceMock = {
    sign: jest.fn(),
  };

  const baseOperator: Operator = {
    id: 'op-1',
    username: 'john',
    name: 'John Doe',
    pinHash: null,
    pinSet: false,
    createdAt: new Date('2026-01-01T00:00:00Z'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jwtServiceMock.sign.mockReturnValue('signed-jwt-token');
    service = new AuthService(
      prismaMock as unknown as PrismaService,
      jwtServiceMock as unknown as JwtService,
    );
  });

  describe('login', () => {
    it('throws NotFoundException for an unknown username', async () => {
      prismaMock.operator.findUnique.mockResolvedValue(null);

      await expect(service.login('ghost')).rejects.toThrow(NotFoundException);
      expect(prismaMock.operator.findUnique).toHaveBeenCalledWith({
        where: { username: 'ghost' },
      });
    });

    it('returns operatorId and pinSet for an existing operator', async () => {
      prismaMock.operator.findUnique.mockResolvedValue({
        ...baseOperator,
        pinSet: true,
        pinHash: 'some-hash',
      });

      await expect(service.login('john')).resolves.toEqual({
        operatorId: 'op-1',
        pinSet: true,
      });
    });
  });

  describe('createPin', () => {
    it('throws NotFoundException when the operator does not exist', async () => {
      prismaMock.operator.findUnique.mockResolvedValue(null);

      await expect(service.createPin('missing', '1234')).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaMock.operator.updateMany).not.toHaveBeenCalled();
    });

    it('throws ConflictException when the operator already has a PIN set', async () => {
      prismaMock.operator.findUnique.mockResolvedValue({
        ...baseOperator,
        pinSet: true,
        pinHash: 'existing-hash',
      });

      await expect(service.createPin('op-1', '1234')).rejects.toThrow(
        ConflictException,
      );
      expect(prismaMock.operator.updateMany).not.toHaveBeenCalled();
    });

    it('throws ConflictException when a concurrent request set the PIN first (updateMany count 0)', async () => {
      prismaMock.operator.findUnique.mockResolvedValue({ ...baseOperator });
      prismaMock.operator.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.createPin('op-1', '1234')).rejects.toThrow(
        ConflictException,
      );
      expect(prismaMock.operator.updateMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.operator.findUniqueOrThrow).not.toHaveBeenCalled();
      expect(jwtServiceMock.sign).not.toHaveBeenCalled();
    });

    it('hashes the pin with bcrypt, conditionally sets pinSet and returns accessToken + operator', async () => {
      prismaMock.operator.findUnique.mockResolvedValue({ ...baseOperator });
      let storedData: { pinHash: string; pinSet: boolean } | undefined;
      prismaMock.operator.updateMany.mockImplementation(
        ({ data }: { data: { pinHash: string; pinSet: boolean } }) => {
          storedData = data;
          return Promise.resolve({ count: 1 });
        },
      );
      prismaMock.operator.findUniqueOrThrow.mockImplementation(() =>
        Promise.resolve({ ...baseOperator, ...storedData }),
      );

      const result = await service.createPin('op-1', '1234');

      expect(prismaMock.operator.updateMany).toHaveBeenCalledTimes(1);
      const updateArgs = prismaMock.operator.updateMany.mock.calls[0][0] as {
        where: { id: string; pinSet: boolean };
        data: { pinHash: string; pinSet: boolean };
      };
      // Conditional update: only flips operators whose PIN is still unset.
      expect(updateArgs.where).toEqual({ id: 'op-1', pinSet: false });
      expect(updateArgs.data.pinSet).toBe(true);
      // The stored value must be a bcrypt hash of the pin, never the raw pin.
      expect(updateArgs.data.pinHash).not.toBe('1234');
      expect(bcrypt.compareSync('1234', updateArgs.data.pinHash)).toBe(true);

      expect(prismaMock.operator.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'op-1' },
      });
      expect(jwtServiceMock.sign).toHaveBeenCalledWith({
        sub: 'op-1',
        username: 'john',
        name: 'John Doe',
      });
      expect(result).toEqual({
        accessToken: 'signed-jwt-token',
        operator: { id: 'op-1', name: 'John Doe' },
      });
    });
  });

  describe('verifyPin', () => {
    const correctPin = '4321';
    const pinHash = bcrypt.hashSync(correctPin, 4);

    it('throws UnauthorizedException with a generic message for a wrong pin', async () => {
      prismaMock.operator.findUnique.mockResolvedValue({
        ...baseOperator,
        pinSet: true,
        pinHash,
      });

      await expect(service.verifyPin('op-1', '0000')).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
      expect(jwtServiceMock.sign).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException for an unknown operator (same generic message)', async () => {
      prismaMock.operator.findUnique.mockResolvedValue(null);

      await expect(service.verifyPin('missing', correctPin)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
    });

    it('throws UnauthorizedException when the operator has no pin set', async () => {
      prismaMock.operator.findUnique.mockResolvedValue({ ...baseOperator });

      await expect(service.verifyPin('op-1', correctPin)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
    });

    it('returns accessToken and operator on a correct pin', async () => {
      prismaMock.operator.findUnique.mockResolvedValue({
        ...baseOperator,
        pinSet: true,
        pinHash,
      });

      const result = await service.verifyPin('op-1', correctPin);

      expect(jwtServiceMock.sign).toHaveBeenCalledWith({
        sub: 'op-1',
        username: 'john',
        name: 'John Doe',
      });
      expect(result).toEqual({
        accessToken: 'signed-jwt-token',
        operator: { id: 'op-1', name: 'John Doe' },
      });
    });
  });
});
