import { AuthDto } from '@gdk-iam/auth/dto';
import { ApiProperty } from '@nestjs/swagger';
import { IGetResponseWrapper, IResponseMeta } from '@shared/types';

export class GetResponseWrapper<T> implements IGetResponseWrapper<T> {
  @ApiProperty({ type: () => AuthDto })
  data: T;
  meta?: IResponseMeta;
  constructor(data: T, meta?: IResponseMeta) {
    this.data = data;
    this.meta = meta;
  }
}
