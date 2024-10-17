import { Injectable } from '@nestjs/common';
import { AUTH_TOKEN_TYPE } from '@gdk-iam/auth/types';
import {
  IAuthActivities,
  IAuthSignInFailedRecordItem,
  IAuthTokenItem,
} from './types';

@Injectable()
export abstract class AuthActivitiesService {
  abstract pushTokenItemByAuthId(
    authId: string,
    items: IAuthTokenItem[], // * Should be a RefreshToken and an AccessToken
    opts?: any,
  ): Promise<IAuthActivities>;
  abstract pushFailedRecordItemByAuthId(
    authId: string,
    item: IAuthSignInFailedRecordItem,
    opts?: any,
  ): Promise<IAuthActivities>;
  abstract getByAuthId(authId: string): Promise<IAuthActivities>;
  abstract listAll(): Promise<IAuthActivities[]>;
  abstract clearTokenListByAuthId(
    authId: string,
    all: boolean,
    tokenType?: AUTH_TOKEN_TYPE,
  ): Promise<IAuthActivities>;
  abstract deleteByAuthId(authId: string): Promise<IAuthActivities>;
}
