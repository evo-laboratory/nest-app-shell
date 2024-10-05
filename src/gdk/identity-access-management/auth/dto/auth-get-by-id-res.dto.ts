import { ApiProperty } from '@nestjs/swagger';
import { IGetResponseWrapper, IResponseMeta } from '@shared/types';
import { ResponseMetaDto } from '@shared/dto';
import { IAuth } from '../types';
import { AuthDto } from './auth.dto';

export class AuthGetByIdResDto implements IGetResponseWrapper<IAuth> {
  @ApiProperty({ type: () => AuthDto })
  data: IAuth;
  @ApiProperty({ type: ResponseMetaDto })
  meta?: IResponseMeta;
}
