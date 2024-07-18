import { Types } from 'mongoose';
import { ROLE } from './enums/role.enum';
import { IAuth } from '../auth/auth.interface';

export interface IUser {
  authId: Types.ObjectId | IAuth;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  isEmailVerified: boolean;
  roleList: ROLE[];
  createdAt: number;
  updatedAt: number;
}
