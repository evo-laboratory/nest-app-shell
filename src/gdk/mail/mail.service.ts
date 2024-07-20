import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class MailService {
  abstract send(): void;
  abstract sendMany(): void;
}
