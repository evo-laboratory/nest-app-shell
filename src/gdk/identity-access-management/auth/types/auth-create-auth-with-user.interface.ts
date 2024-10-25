import { AUTH_CODE_USAGE, AUTH_METHOD } from '../enums';
import { AUTH_IDENTIFIER_TYPE } from './auth-identifier-type';

export interface IAuthCreateAuthWithUser {
  identifierType: AUTH_IDENTIFIER_TYPE;
  googleSignInId: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  password: string;
  signUpMethod: AUTH_METHOD;
  codeUsage: AUTH_CODE_USAGE;
  isManualVerified: boolean;
}
