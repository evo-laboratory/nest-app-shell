import { IAuthTokenItem } from './auth-token-item.interface';

// * Each Provider should set it's own provider
export type IAuthRegisterToken = Pick<
  IAuthTokenItem,
  'type' | 'tokenId' | 'tokenContent' | 'expiredAt'
>;
