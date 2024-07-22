import { Body, Controller, Post } from '@nestjs/common';
import { GPI, V1 } from '@shared/statics';
import { MAIL_API } from './types/mail.static';
import { MailService } from './mail.service';
import { SendMailDto } from './dto/send-mail.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags(MAIL_API)
@Controller(`${GPI}/${MAIL_API}`)
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post(`${V1}`)
  send(@Body() sendMailDto: SendMailDto) {
    return this.mailService.send(sendMailDto);
  }
}
