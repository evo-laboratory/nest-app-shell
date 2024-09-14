import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthType } from '@gdk-iam/auth/decorators/auth-type.decorator';
import { AUTH_TYPE } from '@gdk-iam/auth/types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('env')
  getEnv(): any {
    return this.appService.getPublicEnv();
  }

  @AuthType(AUTH_TYPE.NONE)
  @Get('test')
  async getTest() {
    return await this.appService.getSwaggerJson();
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
