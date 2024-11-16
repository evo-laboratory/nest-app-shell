import { MailService } from '@gdk-mail/mail.service';
import { Inject, Injectable, Logger } from '@nestjs/common';
import * as SendGrid from '@sendgrid/mail';
import { ClientResponse } from '@sendgrid/mail';
import {
  MethodLogger,
  WINSTON_LOG_VARIANT_LEVEL,
} from '@shared/winston-logger';
import {
  ISendGridSendMailResItem,
  ISendMail,
  ISendMailRes,
} from '@gdk-mail/types';
import { ConfigType } from '@nestjs/config';
import mailConfig from '@gdk-mail/mail.config';
import {
  ERROR_CODE,
  ERROR_SOURCE,
  IUnitedHttpException,
  UniteHttpException,
} from '@shared/exceptions';

@Injectable()
export class MailSendgridService implements MailService {
  private DEFAULT_SENDER = '';
  private readonly Logger = new Logger(MailSendgridService.name);

  constructor(
    @Inject(mailConfig.KEY)
    private readonly mailEnvConfig: ConfigType<typeof mailConfig>,
  ) {
    this.init();
  }

  private init(): void {
    SendGrid.setApiKey(this.mailEnvConfig.SENDGRID_API_KEY);
    this.DEFAULT_SENDER = this.mailEnvConfig.SENDGRID_SENDER_EMAIL;
    this.Logger.log(this.DEFAULT_SENDER, {
      level: WINSTON_LOG_VARIANT_LEVEL.INFO,
      methodName: 'init.DEFAULT_SENDER',
    });
  }

  @MethodLogger()
  public async send(dto: ISendMail): Promise<ISendMailRes> {
    this.Logger.verbose(`${dto.from}`, 'send(dto.from)');
    this.Logger.verbose(`${dto.to}`, 'send(dto.to)');
    this.Logger.verbose(`${dto.subject}`, 'send(dto.subject)');
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
      this.throwHttpError(
        ERROR_CODE.MAIL_PROVIDER_FAILED,
        error.message || error || 'Unknown error from Sendgrid',
        500,
        'send',
      );
    }
  }
  public sendMany(): void {
    throw new Error('Method not implemented.');
  }

  private throwHttpError(
    code: ERROR_CODE,
    msg: string,
    statusCode?: number,
    methodName?: string,
  ): IUnitedHttpException {
    const errorObj: IUnitedHttpException = {
      source: ERROR_SOURCE.SENDGRID_MAIL,
      errorCode: code || ERROR_CODE.UNKNOWN,
      message: msg,
      statusCode: statusCode || 500,
      contextName: 'MailSendgridService',
      methodName: `${methodName}`,
    };
    throw new UniteHttpException(errorObj);
  }
}
