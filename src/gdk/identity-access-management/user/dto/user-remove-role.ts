import { IsString } from 'class-validator';
import { IUserUpdateRole } from '../types';

export class UserRemoveRoleDto implements IUserUpdateRole {
  @IsString()
  userId: string;

  @IsString()
  roleName: string;
}
