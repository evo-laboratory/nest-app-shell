import { IAuthTokenItem } from '@gdk-iam/auth-activities/types';

// * Each Provider should set it's own provider
export type IAuthRegisterToken = Pick<
  IAuthTokenItem,
  'type' | 'tokenId' | 'tokenContent' | 'expiredAt'
>;
