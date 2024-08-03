import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailSendgridService } from './providers/mail.sendgrid/mail.sendgrid.service';
import { MailController } from './mail.controller';
import { ConfigModule } from '@nestjs/config';
import mailConfig from './mail.config';

@Module({
  imports: [ConfigModule.forFeature(mailConfig)],
  providers: [
    {
      provide: MailService,
      useClass: MailSendgridService,
    },
  ],
  controllers: [MailController],
  exports: [
    {
      provide: MailService,
      useClass: MailSendgridService,
    },
  ],
})
export class MailModule {}
