import { IClient } from './client.interface';
import { IRole } from './role.interface';

export interface IFlexUpdateSystem {
  roles: IRole[];
  clients: IClient[];
}
