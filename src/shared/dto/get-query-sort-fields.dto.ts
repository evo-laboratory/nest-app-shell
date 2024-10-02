import { SORT } from '@shared/enums';
import { IGetQuerySortFields } from '@shared/types';

export class GetQuerySortFieldsDto implements IGetQuerySortFields {
  [key: string]: SORT;
  constructor(fields: { [key: string]: SORT }) {
    Object.keys(fields).forEach((key) => {
      if (fields[key] !== SORT.ASC && fields[key] !== SORT.DESC) {
        throw new Error(`Invalid sort value for field ${key}: ${fields[key]}`);
      }
    });
    Object.assign(this, fields); // Dynamically assign fields passed in the constructor
  }
}
