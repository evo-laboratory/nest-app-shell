import { Body, Controller, Param, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GPI, V1 } from '@shared/statics';

import { SYNC_HTTP_ENDPOINTS_PATH, SYSTEM_API } from './statics';
import { SystemService } from './system.service';
import { FlexUpdateSystemDto } from './dto';
@ApiTags(SYSTEM_API)
@Controller(`${GPI}/${SYSTEM_API}`)
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

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
