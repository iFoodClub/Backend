/* eslint-disable @typescript-eslint/no-empty-function */

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';

if (!process.env.TEST_VERBOSE) {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
  jest.spyOn(console, 'debug').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
}
