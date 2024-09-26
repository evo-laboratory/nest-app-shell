import { ResponseMeta } from '@shared/types';
import { IGetResponseWrapper } from '@shared/types/get-response-wrapper.interface';

function GetResponseWrap<T>(
  data: T,
  meta?: ResponseMeta,
): IGetResponseWrapper<T> {
  return {
    data: data,
    meta: meta,
  };
}

export default GetResponseWrap;
