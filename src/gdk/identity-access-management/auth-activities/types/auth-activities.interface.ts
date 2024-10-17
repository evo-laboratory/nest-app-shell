import { Types } from 'mongoose';
import { IAuthTokenItem } from './auth-token-item.interface';
import { IAuthSignInFailedRecordItem } from './auth-sign-in-failed-record-item.interface';

export interface IAuthActivities {
  authId: Types.ObjectId;
  refreshTokenList: IAuthTokenItem[];
  accessTokenList: IAuthTokenItem[];
  signInFailRecordList: IAuthSignInFailedRecordItem[];
  lastIssueAccessTokenAt: number;
  lastIssueRefreshTokenAt: number;
}
