import { OAuth2Client } from 'google-auth-library';

export default class GoogleAuthClient {
  clientInstance: OAuth2Client;

  public init(id: string, secret: string) {
    this.clientInstance = new OAuth2Client(id, secret);
    return this;
  }

  public getInstance(): OAuth2Client {
    return this.clientInstance;
  }
}
