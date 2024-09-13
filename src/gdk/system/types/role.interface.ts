import { ROLE_SET_METHOD } from '@gdk-system/enums/role-set-method.enum';

export interface IRole {
  name: string;
  setMethod: ROLE_SET_METHOD;
  endpointPermissions: string[];
  description: string;
  createdAt?: number;
  updatedAt?: number;
}
