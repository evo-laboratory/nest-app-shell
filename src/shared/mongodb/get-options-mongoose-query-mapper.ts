import { IGetOptions } from '@shared/types';

export function GetOptionsMongooseQueryMapper(opt: IGetOptions) {
  // * Expected from GetOptionsDto
  const mapped = {
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
