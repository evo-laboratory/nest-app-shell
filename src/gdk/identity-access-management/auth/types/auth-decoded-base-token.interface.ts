export interface IAuthDecodedBaseToken {
  sub: string; // * authId
  userId: string;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
}
