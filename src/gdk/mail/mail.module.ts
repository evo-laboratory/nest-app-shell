import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailSendgridService } from './providers/mail.sendgrid/mail.sendgrid.service';

@Module({
  providers: [
    {
      provide: MailService,
      useClass: MailSendgridService,
    },
  ],
})
export class MailModule {}
