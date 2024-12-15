import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { V1 } from '@shared/statics';

import {
  ENV_PATH,
  SYNC_HTTP_ENDPOINTS_PATH,
  SYSTEM_API,
  SYSTEM_CONTROLLER_PATH,
} from './statics';
import { SystemService } from './system.service';
import { FlexUpdateSystemDto, SystemGetOneResDto } from './dto';
import { SystemUtilService } from './system-util/system-util.service';
@ApiTags(SYSTEM_API)
@Controller(`${SYSTEM_CONTROLLER_PATH}`)
export class SystemController {
  constructor(
    private readonly systemService: SystemService,
    private readonly systemUtil: SystemUtilService,
  ) {}

  @Get(`${V1}/${ENV_PATH}`)
  @ApiOperation({
    summary: 'Get public environment variables',
  })
  async getEnvV1() {
    return this.systemUtil.getPublicEnv();
  }

  @Get(`${V1}`)
  @ApiResponse({ status: 200, type: SystemGetOneResDto })
  @ApiOperation({
    summary: 'Get system data',
  })
  async getSystemV1() {
    return await this.systemService.findOne();
  }

  @Put(`${V1}/${SYNC_HTTP_ENDPOINTS_PATH}`)
  @ApiOperation({
    summary: 'Sync http endpoints from swagger',
  })
  async syncHttpEndpointsV1() {
    return await this.systemService.syncHttpEndpointFromSwagger();
  }

  @Put(`${V1}/:id`)
  @ApiOperation({
    summary: 'Update system data by id',
  })
  async updateByIdV1(
    @Param('id') id: string,
    @Body() dto: FlexUpdateSystemDto,
  ) {
    return await this.systemService.updateById(id, dto);
  }
}
