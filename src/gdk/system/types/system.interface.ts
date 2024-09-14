import { IHttpEndpoint } from './http-endpoint.interface';
import { IRole } from './role.interface';

export interface ISystem {
  roles: IRole[];
  rolesUpdatedAt: number;
  endpoints: IHttpEndpoint[];
  endpointUpdatedAt: number;
  createdAt: number;
  updatedAt: number;
}
