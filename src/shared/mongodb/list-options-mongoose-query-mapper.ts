import { PAGINATION_METHOD } from '@shared/enums';
import { IGetListOptions } from '@shared/types';
import { StringToObjectId } from './string-to-object-id';

export function ListOptionsMongooseQueryMapper(opt: IGetListOptions) {
  // * Expected from GetListOptionsDto
  const mapped = {
    filterObjs: {},
    sortObjs: {},
    populateFields: '',
    selectedFields: '',
    skip: 0,
    limit: 0,
  };
  if (opt.paginationMethod === PAGINATION_METHOD.OFFSET) {
    mapped.skip = opt.pageLimit * opt.pageNumber;
    mapped.limit = opt.pageLimit;
  } else if (opt.paginationMethod === PAGINATION_METHOD.CURSOR) {
    mapped.limit = opt.pageLimit;
  }
  if (typeof opt.filters === 'object' && JSON.stringify(opt.filters) !== '{}') {
    mapped.filterObjs = Object.keys(opt.filters).reduce((accMap, currKey) => {
      const val = opt.filters[currKey];
      if (typeof val === 'boolean') {
        accMap[currKey] = val;
      } else if (Array.isArray(val)) {
        accMap[currKey] = {
          $in: val,
        };
      } else if (typeof val === 'string') {
        accMap[currKey] = {
          $regex: `.*${val}.*`,
        };
      }
      return accMap;
    }, {});
  }
  if (
    opt.paginationMethod === PAGINATION_METHOD.CURSOR &&
    opt.pageCursorToken
  ) {
    mapped.filterObjs['_id'] = {
      $gt: StringToObjectId(opt.pageCursorToken),
    };
  }
  if (
    typeof opt.sortFields === 'object' &&
    JSON.stringify(opt.sortFields) !== '{}'
  ) {
    mapped.sortObjs = Object.keys(opt.sortFields).reduce((accMap, currKey) => {
      accMap[currKey] = opt.sortFields[currKey].toLowerCase();
      return accMap;
    }, {});
  }
  if (opt.relationFields) {
    const splitted = opt.relationFields.split(',');
    mapped.populateFields = splitted.join(' ');
  }
  if (opt.fieldSelection) {
    const splitted = opt.fieldSelection.split(',');
    mapped.selectedFields = splitted.join(' ');
  }
  return mapped;
}
