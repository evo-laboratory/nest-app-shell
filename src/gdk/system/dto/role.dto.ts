import { ROLE_SET_METHOD } from '@gdk-system/enums';
import { IRole } from '@gdk-system/types';
import { IsArray, IsEnum, IsNumber, IsString } from 'class-validator';

export class RoleDto implements IRole {
  @IsString()
  name: string;
  @IsEnum(ROLE_SET_METHOD)
  setMethod: ROLE_SET_METHOD;
  @IsArray()
  @IsString({ each: true })
  endpointPermissions: string[];
  @IsString()
  description: string;
  @IsNumber()
  createdAt: number;
  @IsNumber()
  updatedAt: number;
}
