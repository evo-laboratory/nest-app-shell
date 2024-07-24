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

export type ICreateAuthResult = Pick<
  IAuth,
  'identifierType' | 'identifier' | 'code' | 'codeUsage' | 'codeExpiredAt'
>;
