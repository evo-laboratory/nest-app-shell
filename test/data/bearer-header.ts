export function BearerHeader(token: string) {
  return {
    authorization: `Bearer ${token}`,
  };
}
