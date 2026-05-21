import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../../infrastructure/database/repositories/user.repository';

@Injectable()
export class ConfirmRestaurantEmailChangeUseCase {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(token: string): Promise<{ message: string; email: string }> {
    if (!token) {
      throw new BadRequestException('Token de confirmação não informado.');
    }

    const user = await this.userRepository.findByEmailChangeToken(token);
    if (!user) {
      throw new BadRequestException(
        'Token de confirmação inválido ou já utilizado.',
      );
    }

    if (!user.pendingEmail) {
      throw new BadRequestException(
        'Não há solicitação de troca de e-mail pendente para este token.',
      );
    }

    if (
      !user.emailChangeTokenExpiresAt ||
      user.emailChangeTokenExpiresAt.getTime() < Date.now()
    ) {
      await this.userRepository.update(user.id, {
        pendingEmail: null as unknown as undefined,
        emailChangeToken: null as unknown as undefined,
        emailChangeTokenExpiresAt: null as unknown as undefined,
      });
      throw new BadRequestException(
        'Token de confirmação expirado. Solicite uma nova alteração de e-mail.',
      );
    }

    const newEmail = user.pendingEmail;

    const existingWithEmail = await this.userRepository.findByEmail(newEmail);
    if (existingWithEmail && existingWithEmail.id !== user.id) {
      throw new BadRequestException(
        'Já existe um usuário cadastrado com este e-mail.',
      );
    }

    await this.userRepository.update(user.id, {
      email: newEmail,
      pendingEmail: null as unknown as undefined,
      emailChangeToken: null as unknown as undefined,
      emailChangeTokenExpiresAt: null as unknown as undefined,
    });

    return {
      message: 'E-mail confirmado e atualizado com sucesso.',
      email: newEmail,
    };
  }
}
