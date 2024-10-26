import { IClient } from './client.interface';
import { IRole } from './role.interface';

export interface IUpdateSystem {
  roles?: IRole[];
  rolesUpdatedAt?: Date;
  clients?: IClient[];
  clientsUpdatedAt?: Date;
  newSignUpDefaultUserRole?: string;
}
