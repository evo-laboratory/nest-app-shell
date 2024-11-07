import { Types } from 'mongoose';
import { IClient } from './client.interface';
import { IHttpEndpoint } from './http-endpoint.interface';
import { IRole } from './role.interface';

export interface ISystem {
  _id?: Types.ObjectId;
  roles: IRole[];
  rolesUpdatedAt: Date;
  endpoints: IHttpEndpoint[];
  endpointUpdatedAt: Date;
  clients: IClient[];
  newSignUpDefaultUserRole: string;
  clientUpdatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
