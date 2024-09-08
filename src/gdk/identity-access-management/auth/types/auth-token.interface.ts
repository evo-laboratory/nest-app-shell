import { AUTH_TOKEN_TYPE } from './auth-token-type.enum';

export interface IAuthToken {
  type: AUTH_TOKEN_TYPE;
  token: string;
}
