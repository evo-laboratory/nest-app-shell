import { PAGINATION_METHOD, SORT } from '@shared/enums';

export interface IGetQueryOptions {
  paginationMethod: PAGINATION_METHOD;
  pageCursorToken?: string; // * When paginationMethod is CURSOR
  pageOffset?: number; // * When paginationMethod is OFFSET
  pageLimit?: number; // * When paginationMethod is OFFSET
  sort?: SORT; // * Default ASC
  fieldSelection?: string;
}
