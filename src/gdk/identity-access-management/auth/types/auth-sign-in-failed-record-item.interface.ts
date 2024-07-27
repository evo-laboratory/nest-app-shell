import { AUTH_METHOD } from './auth-method.enum';

export interface IAuthSignInFailedRecordItem {
  signInMethod: AUTH_METHOD;
  errorCode: string;
  ipAddress: string;
  failedPassword: string;
  createdAt: number;
}
