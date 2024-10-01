import { IGetResponseWrapper, IResponseMeta } from '@shared/types';
import { IAuth } from '../types';
import { ApiProperty } from '@nestjs/swagger';
import { AuthDto } from './auth.dto';
import { ResponseMetaDto } from '@shared/dto';

export class AuthListAuthResDto implements IGetResponseWrapper<IAuth[]> {
  @ApiProperty({ type: () => [AuthDto] })
  data: IAuth[];
  @ApiProperty({ type: ResponseMetaDto })
  meta?: IResponseMeta;
}
