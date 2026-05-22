import { BadRequestException } from '@nestjs/common';
import { ConfirmRestaurantEmailChangeUseCase } from './confirm-restaurant-email-change.use-case';

describe('ConfirmRestaurantEmailChangeUseCase', () => {
  let userRepo: any;
  let useCase: ConfirmRestaurantEmailChangeUseCase;

  beforeEach(() => {
    userRepo = {
      findByEmailChangeToken: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
    };
    useCase = new ConfirmRestaurantEmailChangeUseCase(userRepo);
  });

  it('lança BadRequest quando o token é vazio', async () => {
    await expect(useCase.execute('')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('lança BadRequest quando não acha usuário pelo token', async () => {
    userRepo.findByEmailChangeToken.mockResolvedValue(null);
    await expect(useCase.execute('xyz')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('lança BadRequest quando o usuário não tem pendingEmail', async () => {
    userRepo.findByEmailChangeToken.mockResolvedValue({
      id: 10,
      email: 'a@x.com',
      pendingEmail: null,
      emailChangeTokenExpiresAt: new Date(Date.now() + 60_000),
    });
    await expect(useCase.execute('xyz')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('lança BadRequest e limpa o token quando está expirado', async () => {
    userRepo.findByEmailChangeToken.mockResolvedValue({
      id: 10,
      email: 'a@x.com',
      pendingEmail: 'b@x.com',
      emailChangeTokenExpiresAt: new Date(Date.now() - 1000),
    });

    await expect(useCase.execute('xyz')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(userRepo.update).toHaveBeenCalledWith(
      10,
      expect.objectContaining({
        pendingEmail: null,
        emailChangeToken: null,
        emailChangeTokenExpiresAt: null,
      }),
    );
  });

  it('lança BadRequest quando o e-mail pendente foi cadastrado por outro usuário enquanto isso', async () => {
    userRepo.findByEmailChangeToken.mockResolvedValue({
      id: 10,
      email: 'a@x.com',
      pendingEmail: 'b@x.com',
      emailChangeTokenExpiresAt: new Date(Date.now() + 60_000),
    });
    userRepo.findByEmail.mockResolvedValue({ id: 99 });

    await expect(useCase.execute('xyz')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('atualiza o e-mail e limpa os campos de troca quando tudo OK', async () => {
    userRepo.findByEmailChangeToken.mockResolvedValue({
      id: 10,
      email: 'a@x.com',
      pendingEmail: 'b@x.com',
      emailChangeTokenExpiresAt: new Date(Date.now() + 60_000),
    });
    userRepo.findByEmail.mockResolvedValue(null);
    userRepo.update.mockResolvedValue({ id: 10 });

    const result = await useCase.execute('xyz');

    expect(result).toEqual({
      message: expect.stringContaining('sucesso'),
      email: 'b@x.com',
    });
    expect(userRepo.update).toHaveBeenCalledWith(
      10,
      expect.objectContaining({
        email: 'b@x.com',
        pendingEmail: null,
        emailChangeToken: null,
        emailChangeTokenExpiresAt: null,
      }),
    );
  });
});
