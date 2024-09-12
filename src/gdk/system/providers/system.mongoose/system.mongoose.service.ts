import { SystemService } from '@gdk-system/system.service';
import { Injectable } from '@nestjs/common';
import { MethodLogger } from '@shared/winston-logger';

@Injectable()
export class SystemMongooseService implements SystemService {
  @MethodLogger()
  create(dto: any): Promise<any> {
    throw new Error('Method not implemented.');
  }
  @MethodLogger()
  findOne(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  @MethodLogger()
  public async syncHttpEndpointFromSwagger(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  @MethodLogger()
  updateById(id: string, dto: any): Promise<any> {
    throw new Error('Method not implemented.');
  }
  @MethodLogger()
  deleteById(id: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
