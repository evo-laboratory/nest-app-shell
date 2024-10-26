import { AUTH_METHOD } from '../enums';
export interface IAuthSocialSignInUp {
  method: AUTH_METHOD;
  token: string;
}
