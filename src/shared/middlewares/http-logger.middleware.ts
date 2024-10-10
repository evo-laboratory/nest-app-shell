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
      // * It's already string, we would to view in better way
      WinstonLogger.debug(JSON.parse(body));
      originalSend.call(this, body);
    };
    WinstonLogger.http(
      `[Controller] ${req.method} ${req.baseUrl}${req.url} - Start`,
    );
    if (req.method !== 'GET') {
      WinstonLogger.debug(req.body);
    }
    res.on('finish', () => {
      const endMs: number = new Date().getTime();
      WinstonLogger.http(
        `[Controller] ${req.method} ${req.baseUrl}${req.url} - [${
          res.statusCode
        }] Took time : ${endMs - startMs} ms`,
      );
    });
    next();
  }
}
