import { IAuthRevokedRefreshTokenRes } from '../types';

export class AuthRevokeRefreshTokenRes implements IAuthRevokedRefreshTokenRes {
  resultMessage: 'OK';
  isRevokedToken: boolean;
}
