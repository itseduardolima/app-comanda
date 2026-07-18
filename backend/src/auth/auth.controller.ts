import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthResult, AuthService, LoginResult } from './auth.service';
import { Public } from './decorators/public.decorator';
import { CreatePinDto } from './dto/create-pin.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyPinDto } from './dto/verify-pin.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto): Promise<LoginResult> {
    return this.authService.login(dto.username);
  }

  @Public()
  @Post('pin/create')
  @HttpCode(HttpStatus.CREATED)
  createPin(@Body() dto: CreatePinDto): Promise<AuthResult> {
    return this.authService.createPin(dto.operatorId, dto.pin);
  }

  @Public()
  @Post('pin/verify')
  @HttpCode(HttpStatus.OK)
  verifyPin(@Body() dto: VerifyPinDto): Promise<AuthResult> {
    return this.authService.verifyPin(dto.operatorId, dto.pin);
  }
}
