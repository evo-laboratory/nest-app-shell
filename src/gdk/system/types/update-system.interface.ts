import { IRole } from './role.interface';

export interface IUpdateSystem {
  roles?: IRole[];
  rolesUpdatedAt?: number;
}
