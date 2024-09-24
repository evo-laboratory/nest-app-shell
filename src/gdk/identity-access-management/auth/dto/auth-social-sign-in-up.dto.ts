import { IsString, IsEnum } from 'class-validator';
import { AUTH_METHOD, AUTH_TOKEN_TYPE, IAuthSocialSignInUp } from '../types';

export class AuthSocialSignInUpDto implements IAuthSocialSignInUp {
  @IsString()
  @IsEnum(AUTH_TOKEN_TYPE)
  method: AUTH_METHOD;
  @IsString()
  token: string;
}
