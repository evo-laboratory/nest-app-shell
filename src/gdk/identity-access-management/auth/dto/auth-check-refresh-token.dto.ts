import { IsEnum, IsString } from 'class-validator';
import { AUTH_TOKEN_TYPE, IAuthCheckRefreshToken } from '../types';

export class AuthCheckRefreshTokenDto implements IAuthCheckRefreshToken {
  @IsString()
  @IsEnum(AUTH_TOKEN_TYPE)
  type: AUTH_TOKEN_TYPE;
  @IsString()
  token: string;
}
