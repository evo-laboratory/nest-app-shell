import { TEST_CLIENT_ID } from './data.static';

const header = {};

export function ClientKeyHeaderConfig() {
  if (!process.env.CLIENT_KEY_NAME) {
    throw new Error('CLIENT_KEY_NAME is not defined');
  }
  header[`${process.env.CLIENT_KEY_NAME}`] = TEST_CLIENT_ID;
  return header;
}
