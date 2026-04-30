
import { Type } from '@nestjs/common';


export type Mocked<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? jest.Mock : T[K];
};

export function mockOf<T>(ctor: Type<T>): Mocked<T> {
  const proto = ctor.prototype as Record<string, unknown>;
  const mock: Record<string, jest.Mock> = {};

  const names = Object.getOwnPropertyNames(proto).filter(
    (n) => n !== 'constructor' && typeof proto[n] === 'function',
  );

  for (const name of names) {
    mock[name] = jest.fn();
  }

  return mock as unknown as Mocked<T>;
}


export function mockFromMethods<T>(methods: Array<keyof T>): Mocked<T> {
  const mock: Record<string, jest.Mock> = {};
  for (const m of methods) {
    mock[m as string] = jest.fn();
  }
  return mock as unknown as Mocked<T>;
}
