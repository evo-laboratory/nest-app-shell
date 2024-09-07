import { IUserTokenPayload } from '@gdk-iam/user/types';
import { IAuthDecodedBaseToken } from './auth-decoded-base-token.interface';

export interface IAuthDecodedToken
  extends IAuthDecodedBaseToken,
    IUserTokenPayload {}
