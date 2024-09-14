import { IsString } from 'class-validator';
import { IAuthExchangeNewAccessTokenRes } from '../types';

export class AuthExchangeNewAccessTokenRes
  implements IAuthExchangeNewAccessTokenRes
{
  @IsString()
  accessToken: string;
}
