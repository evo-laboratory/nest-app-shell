import { IUser } from './user.interface';

// * Sync with .env JWT_PAYLOAD_PROPS_FROM_USER
export type IUserTokenPayload = Pick<IUser, 'email' | 'roleList'>;
