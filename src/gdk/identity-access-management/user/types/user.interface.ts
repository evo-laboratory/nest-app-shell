import { Types } from 'mongoose';
import { ROLE } from './role.enum';
export interface IUser {
  _id?: Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  isEmailVerified: boolean;
  roleList: ROLE[];
  createdAt: number;
  updatedAt: number;
}
