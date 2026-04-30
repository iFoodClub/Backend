import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  it('getHello delega para AppService', () => {
    const service = new AppService();
    const controller = new AppController(service);
    expect(controller.getHello()).toBe('Hello World!');
  });
});

describe('AppService', () => {
  it('retorna "Hello World!"', () => {
    expect(new AppService().getHello()).toBe('Hello World!');
  });
});
