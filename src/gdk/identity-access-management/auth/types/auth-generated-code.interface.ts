import { IAuth } from './auth.interface';

export type IAuthGeneratedCode = Pick<IAuth, 'code' | 'codeExpiredAt'>;
