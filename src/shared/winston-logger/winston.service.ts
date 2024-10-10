import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';
import WinstonLogger from './winston.logger';
import { IWinstonLogOpt } from './winston-log-option.interface';
import { WINSTON_LOG_VARIANT_LEVEL } from './winston-log-variant.enum';

@Injectable({ scope: Scope.TRANSIENT })
export class WinstonService extends ConsoleLogger {
  constructor() {
    super();
    const ENV_LEVEL = process.env.LOG_LEVEL || 'verbose';
    WinstonLogger.level = ENV_LEVEL;
    WinstonLogger.info(`${ENV_LEVEL}`.toUpperCase(), {
      contextName: 'WinstonService',
      methodName: 'LogLevel',
    });
  }
  // * Level: Verbose
  public verbose(message: any, ...optionalParams: any[]) {
    // * If we use new WstLoggerService(<SERVICE_NAME>), params would be [SERVICE_NAME]
    // * While using Logger.log(<MSG_ITSELF>, <METHOD_NAME>), params would be [<METHOD_NAME>, <SERVICE_NAME>]
    const optParams = [...optionalParams];
    WinstonLogger.verbose(message, {
      contextName: optParams.length === 1 ? optParams[0] : optParams[1],
      methodName: optParams.length === 1 ? '' : optParams[0],
    });
  }
  // * Level: Debug
  public log(message: any, ...optionalParams: any[]) {
    // * Log supports original NestJs usage or pass in a IWinstonLogOpt to customize logging.
    // * If we use new WstLoggerService(<SERVICE_NAME>), params would be [SERVICE_NAME]
    // * While using Logger.log(<MSG_ITSELF>, <LOG_OPT>), params would be [<LOG_OPT>, <SERVICE_NAME>]
    const optParams = [...optionalParams];
    // * Check if pass in LOG_OPT
    if (typeof optParams[0] === 'object' && optParams[0]['level']) {
      const logOpt = optParams[0] as IWinstonLogOpt;
      if (logOpt.level === WINSTON_LOG_VARIANT_LEVEL.INFO) {
        WinstonLogger.info(message, {
          contextName: optParams[1],
          methodName: logOpt.methodName,
        });
      } else if (logOpt.level === WINSTON_LOG_VARIANT_LEVEL.HTTP) {
        WinstonLogger.http(message, {
          contextName: optParams[1],
          methodName: logOpt.methodName,
        });
      } else {
        WinstonLogger.debug(message, {
          contextName: optParams[1],
          methodName: logOpt.methodName,
        });
      }
    } else {
      WinstonLogger.debug(message, {
        contextName: optParams.length === 1 ? optParams[0] : optParams[1],
        methodName: optParams.length === 1 ? '' : optParams[0],
      });
    }
  }
  // * Level: Http is not support, please direct use WinstonLogger
  // * Http level is already using in HttpLoggerMiddleware, you should not use otherwise
  // * You can use http with log with IWinstonLogOpt

  // * Level: Debug
  public debug(message: any, ...optionalParams: any[]) {
    const optParams = [...optionalParams];
    WinstonLogger.debug(message, {
      contextName: optParams.length === 1 ? optParams[0] : optParams[1],
      methodName: optParams.length === 1 ? '' : optParams[0],
    });
  }

  // * Level: Warn
  public warn(message: any, ...optionalParams: any[]) {
    const optParams = [...optionalParams];
    WinstonLogger.warn(message, {
      contextName: optParams.length === 1 ? optParams[0] : optParams[1],
      methodName: optParams.length === 1 ? '' : optParams[0],
    });
  }

  // * Level: Error
  public error(message: any, ...optionalParams: any[]) {
    const optParams = [...optionalParams];
    WinstonLogger.error(message, {
      contextName: optParams.length === 1 ? optParams[0] : optParams[1],
      methodName: optParams.length === 1 ? '' : optParams[0],
    });
  }
}
