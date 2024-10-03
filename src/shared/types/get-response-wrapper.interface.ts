import { IResponseMeta } from './response-meta.interface';

export interface IGetResponseWrapper<T> {
  data: T;
  meta?: IResponseMeta;
}
