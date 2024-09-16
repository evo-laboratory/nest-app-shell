import { IsString } from 'class-validator';
import { IUserAddRole } from '../types';

export class UserAddRoleDto implements IUserAddRole {
  @IsString()
  userId: string;

  @IsString()
  roleName: string;
}
