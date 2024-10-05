import { PAGINATION_METHOD } from '@shared/enums';
import { IGetListFilters } from './get-list-filters.interface';
import { IGetListSortFields } from './get-list-sort-field.interface';

// * Below prop names is related in api.static.ts, please do not change.
export interface IGetListOptions {
  paginationMethod?: PAGINATION_METHOD;
  pageCursorToken?: string; // * When paginationMethod is CURSOR
  pageLimit?: number; // * Consider as PageSize, when paginationMethod is CURSOR and OFFSET
  pageNumber?: number; // * * When paginationMethod is OFFSET
  sortFields?: IGetListSortFields;
  filters?: IGetListFilters;
  fieldSelection?: string;
  relationFields?: string; // * When using MongoDB, will populate
}
