import { IResponseMeta } from '@shared/types';
import { IGetResponseWrapper } from '@shared/types/get-response-wrapper.interface';

export function GetResponseWrap<T>(
  data: T,
  meta?: IResponseMeta,
): IGetResponseWrapper<T> {
  return {
    data: data,
    meta: meta,
  };
}
