import { AUTH_TOKEN_TYPE } from '../enums';
export interface IAuthToken {
  type: AUTH_TOKEN_TYPE;
  token: string;
}
