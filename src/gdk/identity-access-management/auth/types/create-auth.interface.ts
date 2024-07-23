import { IAuth } from './auth.interface';

export type ICreateAuth = Pick<
  IAuth,
  | 'identifier'
  | 'provider'
  | 'signUpMethodList'
  | 'password'
  | 'userId'
  | 'codeUsage'
>;

export type ICreateAuthResult = Pick<
  IAuth,
  'identifier' | 'code' | 'codeUsage' | 'codeExpiredAt'
>;
