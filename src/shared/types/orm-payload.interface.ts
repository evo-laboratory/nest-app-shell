// * We support multiple providers for Database, such as MongoDB, MySQL, PostgreSQL, etc.
// * Provider implements Abstract service, thus we can use the same service in the controller.
// * Different providers would require different implementations and options, thus this payload can adapt different provider.

export interface IOrmPayload {
  mongooseClientSession?: any;
  mongooseSessionDisableSessionCommit?: boolean;
}
