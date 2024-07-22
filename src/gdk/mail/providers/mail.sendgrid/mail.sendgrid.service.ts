import { MailService } from '@gdk-mail/mail.service';
import { ISendMail, ISendMailRes } from '@gdk-mail/types/send-mail.interface';
import { ISendGridSendMailResItem } from '@gdk-mail/types/sendgrid.interface';
import { Injectable } from '@nestjs/common';
import * as SendGrid from '@sendgrid/mail';
import { ClientResponse } from '@sendgrid/mail';

@Injectable()
export class MailSendgridService implements MailService {
  private DEFAULT_SENDER = process.env.SENDGRID_SENDER_EMAIL;
  constructor() {
    SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
  }
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
