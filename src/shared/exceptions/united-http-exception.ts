import { HttpException } from '@nestjs/common';
import WinstonLogger from '@shared/winston-logger/winston.logger';
import { IUnitedHttpException } from './united-http.interface';
import { ERROR_SOURCE } from './error-source.enum';
import { ERROR_CODE } from './error-code.enum';

export class UniteHttpException extends HttpException {
  constructor(public readonly errorObject: IUnitedHttpException) {
    super(
      errorObject,
      errorObject.errorMeta?.statusCode || errorObject.statusCode || 500,
    );
    if (this.errorObject.errorMeta?.processErrorMeta) {
      this.errorObject.source =
        this.errorObject.errorMeta?.source || ERROR_SOURCE.NESTJS;
      this.errorObject.errorCode =
        this.errorObject.errorMeta?.errorCode || ERROR_CODE.UNKNOWN;
      this.errorObject.message = this.errorObject.errorMeta.message;
      this.errorObject.statusCode =
        this.errorObject.errorMeta?.statusCode || 400;
      delete this.errorObject.errorMeta;
    }
    if (process.env.DISABLE_ERROR_META) {
      delete this.errorObject.errorMeta;
    }
    if (!this.errorObject.disableAutoLog) {
      this.log();
    }
    delete this.errorObject.contextName;
    delete this.errorObject.methodName;
    delete this.errorObject.disableAutoLog;
  }

  private log(): void {
    WinstonLogger.error(JSON.stringify(this.errorObject, null, 4), {
      contextName: this.errorObject.contextName || 'UnkContext',
      methodName: this.errorObject.methodName || 'UnkMethod',
    });
  }
}
