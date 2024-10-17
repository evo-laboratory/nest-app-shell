import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthType } from '@gdk-iam/auth/decorators/auth-type.decorator';
import { AUTH_TYPE } from '@gdk-iam/auth/types';
import { ENV_PATH } from '@shared/statics';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get(`${ENV_PATH}`)
  getEnv(): any {
    return this.appService.getPublicEnv();
  }

  @AuthType(AUTH_TYPE.PUBLIC)
  @Get('test')
  async getTest() {
    return await this.appService.getSwaggerJson();
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
