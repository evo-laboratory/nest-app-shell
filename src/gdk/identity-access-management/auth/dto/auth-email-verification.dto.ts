import { IsEmail, IsEnum, IsString } from 'class-validator';
import { IAuthEmailVerification } from '../types/auth.email-verification';
import { AUTH_CODE_USAGE } from '../types';
import { IAuthEmailVerificationRes } from '../types/auth-email-verification.interface';

export class AuthEmailVerificationDto implements IAuthEmailVerification {
  @IsString()
  @IsEmail()
  email: string;
  @IsEnum(AUTH_CODE_USAGE)
  usage: AUTH_CODE_USAGE;
}

export class AuthEmailVerificationRes implements IAuthEmailVerificationRes {
  isDone: boolean;
}
