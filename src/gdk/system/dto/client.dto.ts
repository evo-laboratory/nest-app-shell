import { IClient } from '@gdk-system/types';
import { IsBoolean, IsInt, IsString } from 'class-validator';

export class ClientDto implements IClient {
  @IsString()
  id: string;
  @IsString()
  name: string;
  @IsString()
  secret: string;
  @IsBoolean()
  willExpire: boolean;
  @IsInt()
  expiredAt: number;
}
