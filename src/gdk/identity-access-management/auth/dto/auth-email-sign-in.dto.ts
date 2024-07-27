import { IsEmail, IsString, MinLength } from 'class-validator';
import { IAuthEmailSignIn } from '../types';

export class AuthEmailSignInDto implements IAuthEmailSignIn {
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(6)
  password: string;
}
