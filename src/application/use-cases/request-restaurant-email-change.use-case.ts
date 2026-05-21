import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { RestaurantRepository } from '../../infrastructure/database/repositories/restaurant.repository';
import { UserRepository } from '../../infrastructure/database/repositories/user.repository';
import { EmailService } from '../services/email.service';

const TOKEN_TTL_HOURS = 24;

@Injectable()
export class RequestRestaurantEmailChangeUseCase {
  constructor(
    @Inject('RESTAURANT_REPOSITORY')
    private readonly restaurantRepository: RestaurantRepository,
    @Inject('USER_REPOSITORY')
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(
    restaurantId: number,
    newEmail: string,
  ): Promise<{ message: string }> {
    const restaurant = await this.restaurantRepository.getById(restaurantId);
    if (!restaurant) {
      throw new NotFoundException('Restaurante não encontrado');
    }

    const owner = await this.userRepository.getById(restaurant.userId);
    if (!owner) {
      throw new NotFoundException('Usuário do restaurante não encontrado');
    }

    const normalizedEmail = newEmail.trim().toLowerCase();

    if (normalizedEmail === owner.email.toLowerCase()) {
      throw new BadRequestException(
        'O novo e-mail deve ser diferente do e-mail atual.',
      );
    }

    const existingWithEmail =
      await this.userRepository.findByEmail(normalizedEmail);
    if (existingWithEmail && existingWithEmail.id !== owner.id) {
      throw new BadRequestException(
        'Já existe um usuário cadastrado com este e-mail.',
      );
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + TOKEN_TTL_HOURS);

    const updated = await this.userRepository.update(owner.id, {
      pendingEmail: normalizedEmail,
      emailChangeToken: token,
      emailChangeTokenExpiresAt: expiresAt,
    });
    if (!updated) {
      throw new NotFoundException('Usuário do restaurante não encontrado');
    }

    const verificationUrl = this.buildVerificationUrl(token);
    await this.emailService.send({
      to: normalizedEmail,
      subject: 'Confirme seu novo e-mail no Food Club',
      text: `Olá,\n\nRecebemos uma solicitação para alterar o e-mail de contato do restaurante "${restaurant.name}" para este endereço.\n\nPara confirmar, acesse o link abaixo (válido por ${TOKEN_TTL_HOURS}h):\n${verificationUrl}\n\nSe você não solicitou essa alteração, ignore este e-mail.`,
      html: `<p>Olá,</p><p>Recebemos uma solicitação para alterar o e-mail de contato do restaurante "<strong>${restaurant.name}</strong>" para este endereço.</p><p>Para confirmar, clique no link abaixo (válido por ${TOKEN_TTL_HOURS}h):</p><p><a href="${verificationUrl}">${verificationUrl}</a></p><p>Se você não solicitou essa alteração, ignore este e-mail.</p>`,
    });

    return {
      message: `Enviamos um link de confirmação para ${normalizedEmail}. O e-mail só será alterado após a confirmação.`,
    };
  }

  private buildVerificationUrl(token: string): string {
    const base =
      process.env.FRONTEND_URL ||
      process.env.APP_URL ||
      'http://localhost:3000';
    const trimmed = base.replace(/\/$/, '');
    return `${trimmed}/verify-email-change?token=${token}`;
  }
}
