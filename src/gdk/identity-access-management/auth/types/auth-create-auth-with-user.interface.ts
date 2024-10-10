import { AUTH_CODE_USAGE } from './auth-code-usage.enum';
import { AUTH_IDENTIFIER_TYPE } from './auth-identifier-type';
import { AUTH_METHOD } from './auth-method.enum';

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
