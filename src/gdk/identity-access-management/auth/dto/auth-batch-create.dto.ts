import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { IAuthBatchSignUpDto } from '../types';
import { AuthWithUserItemDto } from './auth-with-user-item.dto';

export class AuthBatchCreateDto implements IAuthBatchSignUpDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AuthWithUserItemDto)
  batchDataList: AuthWithUserItemDto[];
}
