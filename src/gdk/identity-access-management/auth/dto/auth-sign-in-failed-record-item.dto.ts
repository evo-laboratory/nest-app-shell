import { AUTH_METHOD, IAuthSignInFailedRecordItem } from '../types';

export class AuthSignInFailedRecordItemDto
  implements IAuthSignInFailedRecordItem
{
  signInMethod: AUTH_METHOD;
  errorCode: string;
  ipAddress: string;
  failedPassword: string;
  createdAt: number;
}
