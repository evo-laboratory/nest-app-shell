import { AUTH_METHOD } from '@gdk-iam/auth/enums';
import { IAuthSignInFailedRecordItem } from '../types';

export class AuthSignInFailedRecordItemDto
  implements IAuthSignInFailedRecordItem
{
  signInMethod: AUTH_METHOD;
  errorCode: string;
  ipAddress: string;
  failedPassword: string;
  createdAt: Date;
}
