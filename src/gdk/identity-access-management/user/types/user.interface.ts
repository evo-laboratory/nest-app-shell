import { ROLE } from './role.enum';
export interface IUser {
  _id?: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  isEmailVerified: boolean;
  roleList: ROLE[];
  createdAt: number;
  updatedAt: number;
}
