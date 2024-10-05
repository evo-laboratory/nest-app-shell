import { PAGINATION_METHOD } from '@shared/enums';
import { IGetListFilters } from './get-list-filters.interface';
import { IGetListSortFields } from './get-list-sort-field.interface';
import { IGetOptions } from './get-options.interface';

// * Below prop names is related in api.static.ts, please do not change.
export interface IGetListOptions extends IGetOptions {
  paginationMethod?: PAGINATION_METHOD;
  pageCursorToken?: string; // * When paginationMethod is CURSOR
  pageLimit?: number; // * Consider as PageSize, when paginationMethod is CURSOR and OFFSET
  pageNumber?: number; // * * When paginationMethod is OFFSET
  sortFields?: IGetListSortFields;
  filters?: IGetListFilters;
}
