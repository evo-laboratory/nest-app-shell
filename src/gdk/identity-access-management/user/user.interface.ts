import { ROLE } from './enums/role.enum';

export interface IUser {
  authId: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  isEmailVerified: boolean;
  roleList: ROLE[];
  createdAt: number;
  updatedAt: number;
}
