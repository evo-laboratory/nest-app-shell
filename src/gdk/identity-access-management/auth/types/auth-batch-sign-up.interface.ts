import { IBatchCreateDto } from '@shared/types';
import { IAuthWithUserItem } from './auth-with-user-item.interface';

export interface IAuthBatchSignUpDto
  extends IBatchCreateDto<IAuthWithUserItem> {
  jsonData: IAuthWithUserItem[];
}
