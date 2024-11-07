export interface IClient {
  name: string;
  id: string;
  willExpire: boolean;
  expiredAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
