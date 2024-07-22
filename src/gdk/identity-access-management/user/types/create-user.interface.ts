import { IUser } from './user.interface';

export type ICreateUser = Pick<
  IUser,
  'email' | 'firstName' | 'lastName' | 'displayName'
>;
