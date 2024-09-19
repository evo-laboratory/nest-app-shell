export interface IClient {
  name: string;
  id: string;
  secret: string;
  willExpire: boolean;
  expiredAt: number;
  createdAt?: number;
  updatedAt?: number;
}
