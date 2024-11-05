import { Types } from 'mongoose';

export interface IUser {
  _id?: Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  isEmailVerified: boolean;
  roleList: string[];
  isSelfDeleted: boolean;
  backupAuth: any | null;
  selfDeletedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
