import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RequestRestaurantEmailChangeUseCase } from './request-restaurant-email-change.use-case';

describe('RequestRestaurantEmailChangeUseCase', () => {
  let restaurantRepo: any;
  let userRepo: any;
  let emailService: any;
  let useCase: RequestRestaurantEmailChangeUseCase;

  beforeEach(() => {
    restaurantRepo = { getById: jest.fn() };
    userRepo = {
      getById: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
    };
    emailService = { send: jest.fn().mockResolvedValue(undefined) };
    useCase = new RequestRestaurantEmailChangeUseCase(
      restaurantRepo,
      userRepo,
      emailService,
    );
  });

  it('lança NotFound quando o restaurante não existe', async () => {
    restaurantRepo.getById.mockResolvedValue(null);
    await expect(useCase.execute(1, 'novo@x.com')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('lança NotFound quando o usuário do restaurante não existe', async () => {
    restaurantRepo.getById.mockResolvedValue({ id: 1, userId: 10 });
    userRepo.getById.mockResolvedValue(null);
    await expect(useCase.execute(1, 'novo@x.com')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('lança BadRequest quando o novo e-mail é igual ao atual', async () => {
    restaurantRepo.getById.mockResolvedValue({ id: 1, userId: 10 });
    userRepo.getById.mockResolvedValue({
      id: 10,
      email: 'atual@x.com',
    });
    await expect(useCase.execute(1, 'ATUAL@x.com')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(emailService.send).not.toHaveBeenCalled();
  });

  it('lança BadRequest quando o novo e-mail já está em uso por outro usuário', async () => {
    restaurantRepo.getById.mockResolvedValue({ id: 1, userId: 10 });
    userRepo.getById.mockResolvedValue({ id: 10, email: 'atual@x.com' });
    userRepo.findByEmail.mockResolvedValue({ id: 99 });

    await expect(useCase.execute(1, 'novo@x.com')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('aceita quando findByEmail retorna o próprio usuário', async () => {
    restaurantRepo.getById.mockResolvedValue({
      id: 1,
      userId: 10,
      name: 'R',
    });
    userRepo.getById.mockResolvedValue({ id: 10, email: 'atual@x.com' });
    userRepo.findByEmail.mockResolvedValue({ id: 10 });
    userRepo.update.mockResolvedValue({ id: 10 });

    await expect(
      useCase.execute(1, 'atual-novo@x.com'),
    ).resolves.toHaveProperty('message');
  });

  it('gera token, persiste e envia e-mail de confirmação ao novo endereço', async () => {
    restaurantRepo.getById.mockResolvedValue({
      id: 1,
      userId: 10,
      name: 'Sabores',
    });
    userRepo.getById.mockResolvedValue({ id: 10, email: 'atual@x.com' });
    userRepo.findByEmail.mockResolvedValue(null);
    userRepo.update.mockResolvedValue({ id: 10 });

    const result = await useCase.execute(1, 'novo@x.com');

    expect(userRepo.update).toHaveBeenCalledTimes(1);
    const updateArgs = userRepo.update.mock.calls[0];
    expect(updateArgs[0]).toBe(10);
    expect(updateArgs[1].pendingEmail).toBe('novo@x.com');
    expect(typeof updateArgs[1].emailChangeToken).toBe('string');
    expect(updateArgs[1].emailChangeToken).toHaveLength(64);
    expect(updateArgs[1].emailChangeTokenExpiresAt).toBeInstanceOf(Date);

    expect(emailService.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'novo@x.com',
        subject: expect.stringContaining('Confirme'),
      }),
    );
    expect(result.message).toContain('novo@x.com');
  });

  it('normaliza o e-mail para lowercase antes de persistir', async () => {
    restaurantRepo.getById.mockResolvedValue({
      id: 1,
      userId: 10,
      name: 'R',
    });
    userRepo.getById.mockResolvedValue({ id: 10, email: 'atual@x.com' });
    userRepo.findByEmail.mockResolvedValue(null);
    userRepo.update.mockResolvedValue({ id: 10 });

    await useCase.execute(1, '  Novo@X.com  ');

    const updateArgs = userRepo.update.mock.calls[0];
    expect(updateArgs[1].pendingEmail).toBe('novo@x.com');
  });
});
