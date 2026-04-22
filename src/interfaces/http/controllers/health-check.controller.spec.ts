import { HealthCheckController } from './health-check.controller';

describe('HealthCheckController', () => {
  const controller = new HealthCheckController();

  describe('healthCheck', () => {
    it('retorna status "Is Alive!", timestamp e uptime', () => {
      const result = controller.healthCheck();
      expect(result.status).toBe('Is Alive!');
      expect(typeof result.timestamp).toBe('string');
      expect(typeof result.uptime).toBe('number');
    });
  });

  describe('ping', () => {
    it('retorna "pong"', () => {
      expect(controller.ping()).toBe('pong');
    });
  });
});
