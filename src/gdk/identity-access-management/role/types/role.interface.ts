import { ROLE_SET_METHOD } from '../enums';

export interface IRole {
  name: string;
  setMethod: ROLE_SET_METHOD;
  endpointPermissions: string[];
  description: string;
  createdAt: number;
  updatedAt: number;
}
