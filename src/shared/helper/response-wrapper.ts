import { IGetResponseWrapper } from '@shared/types/get-response-wrapper.interface';

function ResponseWrap<T>(data: T, meta: any): IGetResponseWrapper<T> {
  return {
    data: data,
    meta: meta,
  };
}

export default ResponseWrap;
