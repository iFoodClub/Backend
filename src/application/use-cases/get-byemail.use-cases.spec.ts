import { GetUserByEmailService } from './get-byemail.use-cases';

describe('GetUserByEmailService', () => {
  it('retorna o usuário encontrado pelo email', async () => {
    const userRepository = {
      findByEmail: jest.fn().mockResolvedValue({ id: 1, email: 'a@a.com' }),
    };
    const service = new GetUserByEmailService(userRepository as any);

    const user = await service.execute('a@a.com');

    expect(userRepository.findByEmail).toHaveBeenCalledWith('a@a.com');
    expect(user).toEqual({ id: 1, email: 'a@a.com' });
  });

  it('retorna o valor cru do repositório quando não encontra (null)', async () => {
    const userRepository = { findByEmail: jest.fn().mockResolvedValue(null) };
    const service = new GetUserByEmailService(userRepository as any);

    await expect(service.execute('ghost@a.com')).resolves.toBeNull();
  });
});
