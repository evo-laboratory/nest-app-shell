import { AUTH_METHOD } from '@gdk-iam/auth/types';

export interface IAuthSignInFailedRecordItem {
  signInMethod: AUTH_METHOD;
  errorCode: string;
  ipAddress: string;
  failedPassword: string;
  createdAt: number;
}
