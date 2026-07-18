import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class VerifyPinDto {
  @IsString()
  @IsNotEmpty()
  operatorId!: string;

  @Matches(/^\d{4}$/, { message: 'pin must be exactly 4 numeric digits' })
  pin!: string;
}
