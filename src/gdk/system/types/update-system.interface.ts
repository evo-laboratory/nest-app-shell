import { IClient } from './client.interface';
import { IRole } from './role.interface';

export interface IUpdateSystem {
  roles?: IRole[];
  rolesUpdatedAt?: number;
  clients?: IClient[];
  clientsUpdatedAt?: number;
}
