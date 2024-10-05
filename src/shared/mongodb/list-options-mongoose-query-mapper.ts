import { IGetListOptions } from '@shared/types';

export function ListOptionsMongooseQueryMapper(opt: IGetListOptions) {
  const mapped = {
    filterQ: {},
    sortQ: {},
    populateFields: '',
    selectedFields: '',
  };
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
