import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RestaurantRepository } from '../../infrastructure/database/repositories/restaurant.repository';
import { UserRepository } from '../../infrastructure/database/repositories/user.repository';

export interface UpdateRestaurantProfileInput {
  name: string;
  cep: string;
  rua: string;
  cidade: string;
  estado: string;
  number: string;
  complemento?: string;
  phone: string;
  profileImage?: string;
  /**
   * Campos proibidos enviados pelo cliente; usados apenas para erro descritivo.
   */
  cnpj?: unknown;
  email?: unknown;
}

export interface UpdateRestaurantProfileResult {
  id: number;
  userId: number;
  name: string;
  cnpj: string;
  cep: string;
  rua: string;
  cidade: string;
  estado: string;
  number: string;
  complemento?: string;
  phone?: string;
  email: string;
  pendingEmail?: string;
  profileImage?: string;
}

@Injectable()
export class UpdateRestaurantProfileUseCase {
  constructor(
    @Inject('RESTAURANT_REPOSITORY')
    private readonly restaurantRepository: RestaurantRepository,
    @Inject('USER_REPOSITORY')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    restaurantId: number,
    input: UpdateRestaurantProfileInput,
  ): Promise<UpdateRestaurantProfileResult> {
    if (input.cnpj !== undefined) {
      throw new BadRequestException(
        'O CNPJ não pode ser alterado após o cadastro do restaurante.',
      );
    }
    if (input.email !== undefined) {
      throw new BadRequestException(
        'O e-mail deve ser alterado pelo fluxo de verificação (POST /Restaurant/:id/email-change).',
      );
    }

    const restaurant = await this.restaurantRepository.getById(restaurantId);
    if (!restaurant) {
      throw new NotFoundException('Restaurante não encontrado');
    }

    if (input.profileImage) {
      const user = await this.userRepository.updateImage(restaurant.userId, {
        profileImage: input.profileImage,
      });
      if (!user) {
        throw new NotFoundException('Usuário do restaurante não encontrado');
      }
    }

    const updated = await this.restaurantRepository.update(restaurantId, {
      name: input.name,
      cep: input.cep,
      rua: input.rua,
      cidade: input.cidade,
      estado: input.estado,
      number: input.number,
      complemento: input.complemento,
      phone: input.phone,
    });

    const owner = await this.userRepository.getById(restaurant.userId);
    if (!owner) {
      throw new NotFoundException('Usuário do restaurante não encontrado');
    }

    return {
      id: updated.id,
      userId: updated.userId,
      name: updated.name,
      cnpj: updated.cnpj,
      cep: updated.cep,
      rua: updated.rua,
      cidade: updated.cidade,
      estado: updated.estado,
      number: updated.number,
      complemento: updated.complemento,
      phone: updated.phone,
      email: owner.email,
      pendingEmail: owner.pendingEmail,
      profileImage: input.profileImage ?? owner.profileImage,
    };
  }
}
