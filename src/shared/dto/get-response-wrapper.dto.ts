import { AuthDto } from '@gdk-iam/auth/dto';
import { ApiProperty } from '@nestjs/swagger';
import { IGetResponseWrapper, IResponseMeta } from '@shared/types';
import { ResponseMeta } from './response-meta.dto';

export class GetResponseWrapper<T> implements IGetResponseWrapper<T> {
  @ApiProperty({ type: () => AuthDto })
  data: T;
  @ApiProperty({ type: ResponseMeta })
  meta?: IResponseMeta;
  constructor(data: T, meta?: IResponseMeta) {
    this.data = data;
    this.meta = meta;
  }
}
