import { ROLE } from './types/role.enum';
export interface IUser {
  authId: string; // * We do not expect populate Auth from User, please populate from Auth instead.
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  isEmailVerified: boolean;
  roleList: ROLE[];
  createdAt: number;
  updatedAt: number;
}
