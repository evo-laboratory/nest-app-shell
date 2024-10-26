import { ISystem } from '@gdk-system/types';
import { IGetResponseWrapper } from '@shared/types';
import { SystemDto } from './system.dto';
import { ApiProperty } from '@nestjs/swagger';

export class SystemGetOneResDto implements IGetResponseWrapper<ISystem> {
  @ApiProperty({ type: () => SystemDto })
  data: ISystem;
}
