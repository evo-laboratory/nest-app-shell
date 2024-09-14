import { IsEnum, IsString } from 'class-validator';
import { AUTH_TOKEN_TYPE, IAuthSignOut } from '../types';

export class AuthSignOutDto implements IAuthSignOut {
  @IsString()
  @IsEnum(AUTH_TOKEN_TYPE)
  type: AUTH_TOKEN_TYPE;
  @IsString()
  token: string;
}
