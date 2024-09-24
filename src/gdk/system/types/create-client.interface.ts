import { IClient } from './client.interface';

export type ICreateClient = Omit<IClient, 'id' | 'secret'>;
