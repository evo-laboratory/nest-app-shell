import { IClient } from './client.interface';
import { IHttpEndpoint } from './http-endpoint.interface';
import { IRole } from './role.interface';

export interface ISystem {
  roles: IRole[];
  rolesUpdatedAt: number;
  endpoints: IHttpEndpoint[];
  endpointUpdatedAt: number;
  clients: IClient[];
  newSignUpDefaultUserRole: string;
  clientUpdatedAt: number;
  createdAt: number;
  updatedAt: number;
}
