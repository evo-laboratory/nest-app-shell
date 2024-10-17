import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GPI, V1 } from '@shared/statics';

import { ENV_PATH, SYNC_HTTP_ENDPOINTS_PATH, SYSTEM_API } from './statics';
import { SystemService } from './system.service';
import { FlexUpdateSystemDto } from './dto';
import { SystemUtilService } from './system-util/system-util.service';
@ApiTags(SYSTEM_API)
@Controller(`${GPI}/${SYSTEM_API}`)
export class SystemController {
  constructor(
    private readonly systemService: SystemService,
    private readonly systemUtil: SystemUtilService,
  ) {}

  @Get(`${V1}/${ENV_PATH}`)
  async getEnvV1() {
    return this.systemUtil.getPublicEnv();
  }

  @Put(`${V1}/${SYNC_HTTP_ENDPOINTS_PATH}`)
  async syncHttpEndpointsV1() {
    return await this.systemService.syncHttpEndpointFromSwagger();
  }

  @Put(`${V1}/:id`)
  async updateByIdV1(
    @Param('id') id: string,
    @Body() dto: FlexUpdateSystemDto,
  ) {
    return await this.systemService.updateById(id, dto);
  }
}
