import { IGetListOptions } from '@shared/types';

export function ListOptionsMongooseQueryMapper(opt: IGetListOptions) {
  const mapped = {
    filterQ: {},
    sortObjs: {},
    populateFields: '',
    selectedFields: '',
  };
  if (
    typeof opt.sortFields === 'object' &&
    JSON.stringify(opt.sortFields) !== '{}'
  ) {
    mapped.sortObjs = Object.keys(opt.sortFields).reduce((prev, currKey) => {
      prev[currKey] = opt.sortFields[currKey].toLocaleLowerCase();
      return prev;
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
