import { IAuthSignOutRes } from '../types';

export class AuthSignOutRes implements IAuthSignOutRes {
  resultMessage: 'OK';
  isRevokedToken: boolean;
}
