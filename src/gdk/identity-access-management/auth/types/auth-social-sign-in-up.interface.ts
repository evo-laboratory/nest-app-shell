import { AUTH_METHOD } from './auth-method.enum';

export interface IAuthSocialSignInUp {
  method: AUTH_METHOD;
  token: string;
}
