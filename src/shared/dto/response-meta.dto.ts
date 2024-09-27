import { IResponseMeta } from '@shared/types';

export class ResponseMeta implements IResponseMeta {
  count?: number;
  pageNumber?: number;
  constructor(partial: Partial<ResponseMeta>) {
    Object.assign(this, partial);
  }
}
