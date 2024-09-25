import { IAuth } from './auth.interface';

export type ICreateAuth = Pick<
  IAuth,
  | 'identifierType'
  | 'identifier'
  | 'provider'
  | 'signUpMethodList'
  | 'password'
  | 'userId'
  | 'codeUsage'
>;
