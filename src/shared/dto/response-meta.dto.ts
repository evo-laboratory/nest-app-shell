import { IResponseMeta } from '@shared/types';

export class ResponseMetaDto implements IResponseMeta {
  count?: number;
  pageNumber?: number;
  constructor(partial: Partial<ResponseMetaDto>) {
    Object.assign(this, partial);
  }
}
