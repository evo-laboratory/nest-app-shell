// * GDK Application Shell Default File
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import WinstonLogger from '@shared/winston-logger/winston.logger';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: any, next: NextFunction) {
    const startMs: number = new Date().getTime();
    const originalSend: Response['send'] = res.send;
    res.send = function (body) {
      res.parsedBody = body;
      originalSend.call(this, body);
    };
    WinstonLogger.http(`[ CONTROLLER ] ${req.method} ${req.baseUrl}${req.url}`);
    if (req.method !== 'GET' && process.env.STAGE === 'DEV') {
      WinstonLogger.debug(req.body);
    }
    res.on('finish', () => {
      const endMs: number = new Date().getTime();
      WinstonLogger.http(
        `[ CONTROLLER-END ] ${req.method} ${req.baseUrl}${req.url} : [${
          res.statusCode
        }] Time: ${endMs - startMs} ms`,
      );
    });
    next();
  }
}
