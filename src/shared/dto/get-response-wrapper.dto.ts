import { IGetResponseWrapper, IResponseMeta } from '@shared/types';

export class GetResponseWrapper<T> implements IGetResponseWrapper<T> {
  data: T;
  meta?: IResponseMeta;
  constructor(data: T, meta?: IResponseMeta) {
    this.data = data;
    this.meta = meta;
  }
}
