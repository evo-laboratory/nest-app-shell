import { IUser } from './user.interface';

export type IUserTokenPayload = Pick<IUser, 'email' | 'roleList'>;
