import { IHttpEndpoint } from './http-endpoint.interface';
import { IRole } from './role.interface';

export interface IFlexUpdateSystem {
  roles: IRole[];
  endpoints: IHttpEndpoint[];
}
