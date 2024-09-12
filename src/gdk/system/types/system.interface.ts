import { IHttpEndpoint } from './http-endpoint.interface';

export interface ISystem {
  endpoints: IHttpEndpoint[];
  endpointUpdatedAt: number;
}
