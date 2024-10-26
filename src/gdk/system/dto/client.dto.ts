import { IClient } from '@gdk-system/types';
import { IsBoolean, IsInt, IsNumber, IsString } from 'class-validator';

export class ClientDto implements IClient {
  @IsString()
  name: string;
  @IsString()
  id: string;
  @IsBoolean()
  willExpire: boolean;
  @IsInt()
  expiredAt: Date;
  @IsNumber()
  createdAt: Date;
  @IsNumber()
  updatedAt: Date;
}
