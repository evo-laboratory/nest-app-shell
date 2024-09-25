import { IsString, IsEnum } from 'class-validator';
import { AUTH_METHOD, IAuthSocialSignInUp } from '../types';

export class AuthSocialSignInUpDto implements IAuthSocialSignInUp {
  @IsString()
  @IsEnum(AUTH_METHOD)
  method: AUTH_METHOD;
  @IsString()
  token: string;
}
