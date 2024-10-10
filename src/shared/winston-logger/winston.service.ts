import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
import WinstonLogger from './winston.logger';

@Injectable()
export class WstLoggerService implements LoggerService {
  // * Level: Verbose
  public verbose(message: any, ...optionalParams: any[]) {
    const optParams = [...optionalParams];
    WinstonLogger.verbose(message, {
      contextName: optParams.length === 1 ? optParams[0] : optParams[1],
      methodName: optParams.length === 1 ? '' : optParams[0],
    });
  }
  // * Level: Debug
  public log(message: any, ...optionalParams: any[]) {
    // * If we use new WstLoggerService(<SERVICE_NAME>), params would be [SERVICE_NAME]
    // * While using Logger.log(<MSG_ITSELF>, <METHOD_NAME>), params would be [<METHOD_NAME>, <SERVICE_NAME>]
    const optParams = [...optionalParams];
    WinstonLogger.debug(message, {
      contextName: optParams.length === 1 ? optParams[0] : optParams[1],
      methodName: optParams.length === 1 ? '' : optParams[0],
    });
  }

  // * Level: Debug
  public debug(message: any, ...optionalParams: any[]) {
    const optParams = [...optionalParams];
    WinstonLogger.debug(message, {
      contextName: optParams.length === 1 ? optParams[0] : optParams[1],
      methodName: optParams.length === 1 ? '' : optParams[0],
    });
  }

  // * Level: Http is not support, please direct use WinstonLogger
  // * Http level is already using in HttpLoggerMiddleware, you should not use otherwise

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
