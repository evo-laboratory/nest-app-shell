import { Body, Controller, Post } from '@nestjs/common';
import { GPI, V1 } from '@shared/statics';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MailService } from './mail.service';
import { MAIL_API } from './types';
import { SendMailDto, SendMailRes } from './dto';
@ApiTags(MAIL_API)
@Controller(`${GPI}/${MAIL_API}`)
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post(`${V1}`)
  @ApiResponse({ status: 201, type: SendMailRes })
  @ApiOperation({
    summary: 'Send mail trough mail service',
  })
  send(@Body() sendMailDto: SendMailDto) {
    return this.mailService.send(sendMailDto);
  }
}
