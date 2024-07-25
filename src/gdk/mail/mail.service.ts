import { Injectable } from '@nestjs/common';
import { ISendMail, ISendMailRes } from './types';
@Injectable()
export abstract class MailService {
  abstract send(dto: ISendMail): Promise<ISendMailRes>;
  abstract sendMany(): void;
}
