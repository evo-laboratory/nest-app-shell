// eslint-disable-next-line @typescript-eslint/no-var-requires
const { pathsToModuleNameMapper } = require('ts-jest');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { compilerOptions } = require('./tsconfig');
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
  modulePaths: ['<rootDir>'],
  coverageDirectory: '../coverage',
  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: '.*\\.e2e.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: ['**/*.(t|j)s'],
  globalSetup: '<rootDir>/test/helpers/js/jest-e2e.setup.js',
  globalTeardown: '<rootDir>/test/helpers/js/jest-e2e.teardown.js',
  reporters: [
    'default',
    [
      './node_modules/jest-html-reporter',
      {
        pageTitle: `Nest App Shell E2E Test Report ( NODE_ENV: ${process.env.NODE_ENV} )`,
        outputPath: `./test/reports/e2e/${process.env.NODE_ENV}/report.html`,
      },
    ],
  ],
};
