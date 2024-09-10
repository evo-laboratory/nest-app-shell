export enum ROLE_SET_METHOD {
  WHITE_LIST = 'WHITE_LIST',
  BLACK_LIST = 'BLACK_LIST',
  ONLY_PUBLIC = 'ONLY_PUBLIC',
}

export interface IRole {
  name: string;
  setMethod: ROLE_SET_METHOD;
  endpointPermissions: string[];
  description: string;
  createdAt: number;
  updatedAt: number;
}
