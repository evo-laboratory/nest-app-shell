import { IsEnum, IsString } from 'class-validator';
import { AUTH_TOKEN_TYPE, IAuthExchangeNewAccessToken } from '../types';

export class AuthExchangeNewAccessTokenDto
  implements IAuthExchangeNewAccessToken
{
  @IsString()
  @IsEnum(AUTH_TOKEN_TYPE)
  type: AUTH_TOKEN_TYPE;
  @IsString()
  token: string;
}
