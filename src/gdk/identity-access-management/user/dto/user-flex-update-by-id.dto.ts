import { IsOptional, IsString } from 'class-validator';
import { IUserFlexUpdateById } from '../types';

export class UserFlexUpdateByIdDto implements IUserFlexUpdateById {
  @IsString()
  @IsOptional()
  firstName: string;
  @IsString()
  @IsOptional()
  lastName: string;
  @IsString()
  @IsOptional()
  displayName: string;
}
