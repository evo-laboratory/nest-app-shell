import { SORT } from '@shared/enums';
import { IGetQuerySortFields } from '@shared/types';

export class GetQuerySortFieldsDto implements IGetQuerySortFields {
  [key: string]: SORT;
  constructor(fields: { [key: string]: SORT }) {
    Object.assign(this, fields); // Dynamically assign fields passed in the constructor
  }
}
