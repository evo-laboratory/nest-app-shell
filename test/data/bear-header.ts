export function BearHeader(token: string) {
  return {
    // eslint-disable-next-line prettier/prettier
    authorization: `Bearer ${token}`,
  };
}
