import { IClient } from '@gdk-system/types';
import { IsBoolean, IsInt, IsISO8601, IsString } from 'class-validator';

export class ClientDto implements IClient {
  @IsString()
  name: string;
  @IsString()
  id: string;
  @IsBoolean()
  willExpire: boolean;
  @IsInt()
  expiredAt: Date;
  @IsISO8601()
  createdAt: Date;
  @IsISO8601()
  updatedAt: Date;
}
