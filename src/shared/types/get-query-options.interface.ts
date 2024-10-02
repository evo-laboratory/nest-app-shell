import { PAGINATION_METHOD } from '@shared/enums';
import { IGetQueryFilter } from './get-query-filter.interface';
import { IGetQuerySortFields } from './get-query-sort-field.interface';

// * Below prop names is related in api.static.ts, please do not change.
export interface IGetQueryOptions {
  paginationMethod?: PAGINATION_METHOD;
  pageCursorToken?: string; // * When paginationMethod is CURSOR
  pageOffset?: number; // * When paginationMethod is OFFSET
  pageLimit?: number; // * When paginationMethod is OFFSET
  sortFields?: IGetQuerySortFields;
  filters?: IGetQueryFilter;
  fieldSelection?: string;
  relationFields?: string; // * When using MongoDB, will populate
}
