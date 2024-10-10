import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
import WinstonLogger from './winston.logger';

@Injectable()
export class WstLoggerService implements LoggerService {
  public log(message: any, ...optionalParams: any[]) {
    const optParams = [...optionalParams];
    WinstonLogger.info(message, {
      contextName: `${optParams[0]}`,
      methodName: '',
    });
  }
  public error(message: any, ...optionalParams: any[]) {
    throw new Error('Method not implemented.');
  }
  public warn(message: any, ...optionalParams: any[]) {
    throw new Error('Method not implemented.');
  }
  public debug?(message: any, ...optionalParams: any[]) {
    throw new Error('Method not implemented.');
  }
  public setLogLevels?(levels: LogLevel[]) {
    throw new Error('Method not implemented.');
  }
}
