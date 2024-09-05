export interface IAuthDecodedBaseToken {
  tokenId: string;
  sub: string; // * authId
  userId: string;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
}
