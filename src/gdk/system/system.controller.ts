import { Controller, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GPI, V1 } from '@shared/statics';
import { AuthType } from '@gdk-iam/auth/decorators';
import { AUTH_TYPE } from '@gdk-iam/auth/types';

import { SYNC_HTTP_ENDPOINTS_PATH, SYSTEM_API } from './statics';
import { SystemService } from './system.service';
@ApiTags(SYSTEM_API)
@Controller(`${GPI}/${SYSTEM_API}`)
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @AuthType(AUTH_TYPE.NONE)
  @Put(`${V1}/${SYNC_HTTP_ENDPOINTS_PATH}`)
  async syncHttpEndpointsV1() {
    return await this.systemService.syncHttpEndpointFromSwagger();
  }
}
