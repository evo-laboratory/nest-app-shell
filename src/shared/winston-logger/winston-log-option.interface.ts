import { WINSTON_LOG_VARIANT_LEVEL } from './winston-log-variant.enum';

export interface IWinstonLogOpt {
  level: WINSTON_LOG_VARIANT_LEVEL;
  methodName?: string;
}
