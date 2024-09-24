import { MailService } from '@gdk-mail/mail.service';
import { Inject, Injectable } from '@nestjs/common';
import * as SendGrid from '@sendgrid/mail';
import { ClientResponse } from '@sendgrid/mail';
import { MethodLogger } from '@shared/winston-logger';
import {
  ISendGridSendMailResItem,
  ISendMail,
  ISendMailRes,
} from '@gdk-mail/types';
import { ConfigType } from '@nestjs/config';
import mailConfig from '@gdk-mail/mail.config';

@Injectable()
export class MailSendgridService implements MailService {
  private DEFAULT_SENDER = '';

  constructor(
    @Inject(mailConfig.KEY)
    private readonly mailEnvConfig: ConfigType<typeof mailConfig>,
  ) {
    this.init();
  }

  private init(): void {
    SendGrid.setApiKey(this.mailEnvConfig.SENDGRID_API_KEY);
    this.DEFAULT_SENDER = this.mailEnvConfig.SENDGRID_SENDER_EMAIL;
  }

  @MethodLogger()
  public async send(dto: ISendMail): Promise<ISendMailRes> {
    try {
      const sent: [ClientResponse, object] = await SendGrid.send({
        to: dto.to,
        from: dto.from ? dto.from : this.DEFAULT_SENDER,
        subject: dto.subject,
        text: dto.text,
        html: dto.html,
      });
      const result = sent as unknown as ISendGridSendMailResItem[];
      const mappedRes: ISendMailRes = {
        mailId: result[0].headers['x-message-id'],
        statusText: `${result[0].statusCode}`,
      };
      return mappedRes;
    } catch (error) {
      return Promise.reject(error);
    }
  }
  public sendMany(): void {
    throw new Error('Method not implemented.');
  }
}
