import { IAuth } from './auth.interface';

export type ICreateAuth = Pick<
  IAuth,
  'provider' | 'password' | 'userId' | 'codeUsage'
>;
