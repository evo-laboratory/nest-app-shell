import { IAuthTokenItem } from '@gdk-iam/auth/types';
import { Types } from 'mongoose';

export interface IAuthIssuedToken {
  authId: Types.ObjectId;
  activeRefreshTokenList: IAuthTokenItem[];
  accessTokenHistoryList: IAuthTokenItem[]; // * Only tracks latest 100
}
