import { IUser } from './user.interface';

export type IUserFlexUpdateById = Omit<
  IUser,
  | '_id'
  | 'email'
  | 'isEmailVerified'
  | 'roleList'
  | 'createdAt'
  | 'updatedAt'
  | 'selfDeletedAt'
  | 'isSelfDeleted'
  | 'backupAuth'
>;
