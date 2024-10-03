import { PAGINATION_METHOD } from '@shared/enums';
import { IGetListFilters } from './get-list-filters.interface';
import { IGetListSortFields } from './get-list-sort-field.interface';

// * Below prop names is related in api.static.ts, please do not change.
export interface IGetListOptions {
  paginationMethod?: PAGINATION_METHOD;
  pageCursorToken?: string; // * When paginationMethod is CURSOR
  pageOffset?: number; // * When paginationMethod is OFFSET
  pageLimit?: number; // * When paginationMethod is OFFSET
  sortFields?: IGetListSortFields;
  filters?: IGetListFilters;
  fieldSelection?: string;
  relationFields?: string; // * When using MongoDB, will populate
}
