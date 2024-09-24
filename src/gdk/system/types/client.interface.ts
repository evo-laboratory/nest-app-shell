export interface IClient {
  name: string;
  id: string;
  willExpire: boolean;
  expiredAt: number;
  createdAt?: number;
  updatedAt?: number;
}
