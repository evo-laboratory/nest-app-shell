import { ICreateUser } from '../types/create-user.interface';

export class CreateUserDto implements ICreateUser {
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
}
