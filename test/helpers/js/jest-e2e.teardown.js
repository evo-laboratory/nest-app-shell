module.exports = async function (globalConfig, projectConfig) {
  console.info(`Global teardown.... ${process.env.NODE_ENV}`);
  console.log(globalConfig.testPathPattern);
  console.log(projectConfig.cache);

  await globalThis.__MONGOD__.stop();
};
