import { IClient } from '@gdk-system/types';

function ValidateAPIKeyClient(client: IClient): boolean {
  if (!client.willExpire) {
    return true;
  }
  // TODO Id and Secret
  return client.expiredAt > Date.now();
}

export default ValidateAPIKeyClient;
