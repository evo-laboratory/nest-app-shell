import { Types } from 'mongoose';
import { IAuthTokenItem } from './auth-token-item.interface';

export interface IAuthIssuedToken {
  authId: Types.ObjectId;
  activeRefreshTokenList: IAuthTokenItem[];
  accessTokenHistoryList: IAuthTokenItem[]; // * Only tracks latest 100
  lastIssueAccessTokenAt: number;
  lastIssueRefreshTokenAt: number;
}
