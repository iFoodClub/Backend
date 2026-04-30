
import { ExecutionContext } from '@nestjs/common';
import { Response } from 'express';


export function mockResponse(): jest.Mocked<Response> {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res) as any;
  res.json = jest.fn().mockReturnValue(res) as any;
  res.send = jest.fn().mockReturnValue(res) as any;
  res.setHeader = jest.fn().mockReturnValue(res) as any;
  return res as jest.Mocked<Response>;
}

export function mockExecutionContext(
  request: Record<string, any> = {},
): ExecutionContext {
  const http = {
    getRequest: jest.fn().mockReturnValue({
      headers: {},
      method: 'GET',
      url: '/',
      ...request,
    }),
    getResponse: jest.fn().mockReturnValue({}),
    getNext: jest.fn(),
  };
  return {
    switchToHttp: () => http,
    switchToRpc: () => ({}) as any,
    switchToWs: () => ({}) as any,
    getType: () => 'http',
    getClass: () => ({}) as any,
    getHandler: () => ({}) as any,
    getArgs: () => [],
    getArgByIndex: () => undefined,
  } as unknown as ExecutionContext;
}
