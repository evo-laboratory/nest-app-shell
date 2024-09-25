import { IUser } from '@gdk-iam/user/types';
import { IAuth } from './auth.interface';

export interface IAuthCreateAuthWithUserRes {
  newUser: IUser;
  newAuth: IAuth;
}
