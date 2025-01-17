import { AUTH_IDENTIFIER_TYPE, AUTH_METHOD } from '../enums';

export interface IAuthWithUserItem {
  identifier: string;
  identifierType: AUTH_IDENTIFIER_TYPE;
  signUpMethodList: AUTH_METHOD[];
  password: string;
  isIdentifierVerified: boolean;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  isEmailVerified: boolean;
  roleList: string[];
}
