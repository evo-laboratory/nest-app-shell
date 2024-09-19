import { IsString } from 'class-validator';
import { IUserUpdateRole } from '../types';

export class UserAddRoleDto implements IUserUpdateRole {
  @IsString()
  userId: string;

  @IsString()
  roleName: string;
}
