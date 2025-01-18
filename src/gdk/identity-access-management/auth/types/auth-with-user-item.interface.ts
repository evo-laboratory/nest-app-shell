import { IUser } from '@gdk-iam/user/types';
import { IAuth } from './auth.interface';

export type IAuthPropsOfAuthWithUser = Omit<
  IAuth,
  | '_id'
  | 'provider'
  | 'userId'
  | 'code'
  | 'codeUsage'
  | 'codeExpiredAt'
  | 'isActivated'
  | 'createdAt'
  | 'updatedAt'
  | 'inactivatedAt'
  | 'lastChangedPasswordAt'
>;

export type IUserPropsOfAuthWithUserProps = Omit<
  IUser,
  | '_id'
  | 'isSelfDeleted'
  | 'backupAuth'
  | 'selfDeletedAt'
  | 'createdAt'
  | 'updatedAt'
>;

export interface IAuthWithUserItem
  extends IAuthPropsOfAuthWithUser,
    IUserPropsOfAuthWithUserProps {}
