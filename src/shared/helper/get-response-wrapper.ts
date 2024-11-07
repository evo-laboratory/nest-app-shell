import { IResponseMeta } from '@shared/types';
import { IGetResponseWrapper } from '@shared/types/get-response-wrapper.interface';

// * Sometimes we need to return the response with meta data
// * If not required, we can just return the data, e.g. IAuthDataResponse
export function GetResponseWrap<T>(
  data: T,
  meta?: IResponseMeta,
): IGetResponseWrapper<T> {
  return {
    data: data,
    meta: meta,
  };
}
