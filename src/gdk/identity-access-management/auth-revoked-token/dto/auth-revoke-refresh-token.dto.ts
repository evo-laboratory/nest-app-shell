import { IsEnum, IsNotIn, IsString } from 'class-validator';
import { AUTH_TOKEN_TYPE } from '@gdk-iam/auth/enums';
import { IAuthRevokeToken } from '../types';
export class AuthRevokeRefreshTokenDto implements IAuthRevokeToken {
  @IsString()
  @IsEnum(AUTH_TOKEN_TYPE)
  @IsNotIn([AUTH_TOKEN_TYPE.ACCESS])
  type: AUTH_TOKEN_TYPE;
  @IsString()
  token: string;
}
