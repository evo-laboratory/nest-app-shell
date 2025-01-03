import { IClient } from '@gdk-system/types';

function ValidateClient(client: IClient): boolean {
  if (!client.willExpire) {
    return true;
  }
  return client.expiredAt.getTime() > Date.now();
}

export default ValidateClient;
