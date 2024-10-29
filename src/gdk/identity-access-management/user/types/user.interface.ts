import { Types } from 'mongoose';

export interface IUser {
  _id?: Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  isEmailVerified: boolean;
  roleList: string[];
  createdAt: Date;
  updatedAt: Date;
}
