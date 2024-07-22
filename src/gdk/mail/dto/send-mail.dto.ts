import { ISendMail, ISendMailRes } from '@gdk-mail/types/send-mail.interface';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class SendMailDto implements ISendMail {
  @IsEmail()
  to: string;

  @IsOptional()
  @IsEmail()
  from?: string;

  @IsString()
  subject: string;

  @IsString()
  text: string;

  @IsString()
  html: string;
}

export class SendMailRes implements ISendMailRes {
  mailId: string;
  statusText: string;
}
