/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UserType } from '../../domain/models/user.model';
import { CompanyRepository } from '../database/repositories/company.repository';
import { EmployeeRepository } from '../database/repositories/employee.repository';
import { RestaurantRepository } from '../database/repositories/restaurant.repository';
import { DishRepository } from '../database/repositories/dish.repository';
import { UserRepository } from '../database/repositories/user.repository';

/**
 * Guard de ownership para uploads.
 *
 * Mapa atual:
 * - COMPANY: perfis, funcionarios
 * - RESTAURANT: perfis, pratos
 * - EMPLOYEE: funcionarios
 */

interface RequestUser {
  id: number;
  email: string;
  userType: UserType;
  companyId?: number;
  restaurantId?: number;
  employeeId?: number;
}

interface RequestWithUser {
  user: RequestUser;
  method: string;
  url: string;
  params: {
    folder?: string;
    id?: string;
  };
  body: {
    key?: string;
  };
}

@Injectable()
export class UploadOwnershipGuard implements CanActivate {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly employeeRepository: EmployeeRepository,
    private readonly restaurantRepository: RestaurantRepository,
    private readonly dishRepository: DishRepository,
    private readonly userRepository: UserRepository,
  ) { }

  private inferFolderFromUrl(url: string): string | null {
    const urlLower = url.toLowerCase();
    const urlMap: Record<string, string> = {
      '/company': 'perfis',
      '/employee': 'funcionarios',
      '/restaurant': 'perfis',
      '/dish': 'pratos',
    };

    for (const [route, folder] of Object.entries(urlMap)) {
      if (urlLower.includes(route)) {
        return folder;
      }
    }

    return null;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    let { folder } = request.params;
    const { id } = request.params;
    const { key } = request.body || {};
    const url = request.url;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    if (key && request.method === 'DELETE') {
      return this.validateDeleteOwnership(key, user);
    }

    if (!folder && url) {
      folder = this.inferFolderFromUrl(url);
    }

    if (id && folder) {
      return this.validateUpdateOwnership(folder, parseInt(id), user);
    }

    return true;
  }

  private async validateDeleteOwnership(
    key: string,
    user: RequestUser,
  ): Promise<boolean> {
    const folder = key.split('/')[0];

    switch (user.userType) {
      case UserType.COMPANY:
        if (folder === 'perfis') {
          return this.validateCompanyOwnsImage(key, user.companyId);
        }
        if (folder === 'funcionarios') {
          return this.validateEmployeeImageBelongsToCompany(
            key,
            user.companyId,
          );
        }
        break;

      case UserType.RESTAURANT:
        if (folder === 'perfis') {
          return this.validateRestaurantOwnsImage(key, user.restaurantId);
        }
        if (folder === 'pratos') {
          return this.validateDishImageBelongsToRestaurant(
            key,
            user.restaurantId,
          );
        }
        break;

      case UserType.EMPLOYEE:
        if (folder === 'funcionarios') {
          return this.validateEmployeeOwnsImage(key, user.id);
        }
        break;
    }

    throw new ForbiddenException('Sem permissão para deletar esta imagem');
  }

  private async validateUpdateOwnership(
    folder: string,
    entityId: number,
    user: RequestUser,
  ): Promise<boolean> {
    switch (user.userType) {
      case UserType.COMPANY:
        if (folder === 'perfis') {
          if (entityId !== user.companyId) {
            throw new ForbiddenException(
              'Você só pode atualizar sua própria empresa',
            );
          }
          return true;
        }

        if (folder === 'funcionarios') {
          const employee = await this.employeeRepository.getById(entityId);

          if (!employee) {
            throw new NotFoundException('Funcionário não encontrado');
          }

          if (employee.company.id !== user.companyId) {
            throw new ForbiddenException(
              'Este funcionário não pertence à sua empresa',
            );
          }
          return true;
        }
        break;

      case UserType.RESTAURANT:
        if (folder === 'perfis') {
          if (entityId !== user.restaurantId) {
            throw new ForbiddenException(
              'Você só pode atualizar seu próprio restaurante',
            );
          }
          return true;
        }

        if (folder === 'pratos') {
          if (!user.restaurantId) {
            throw new ForbiddenException(
              'restaurantId não encontrado no token JWT. Faça login novamente.',
            );
          }

          const dish = await this.dishRepository.getById(entityId);

          if (!dish) {
            throw new NotFoundException('Prato não encontrado');
          }

          if (dish.restaurantId !== user.restaurantId) {
            throw new ForbiddenException(
              `Este prato não pertence ao seu restaurante. Prato pertence ao restaurante ${dish.restaurantId}, você é do restaurante ${user.restaurantId}`,
            );
          }
          return true;
        }
        break;

      case UserType.EMPLOYEE:
        if (folder === 'funcionarios') {
          if (entityId !== user.employeeId) {
            throw new ForbiddenException(
              'Você só pode atualizar seu próprio perfil',
            );
          }
          return true;
        }
        break;
    }

    throw new ForbiddenException('Sem permissão para atualizar');
  }

  private async validateCompanyOwnsImage(
    key: string,
    companyId: number,
  ): Promise<boolean> {
    const company = await this.companyRepository.getById(companyId);

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    if (!company.profileImage || !company.profileImage.includes(key)) {
      throw new ForbiddenException('Esta imagem não pertence à sua empresa');
    }

    return true;
  }

  private async validateEmployeeImageBelongsToCompany(
    key: string,
    companyId: number,
  ): Promise<boolean> {
    const employees =
      await this.employeeRepository.listByCompanyWithProfileImage(companyId);

    const ownsImage = employees.some(
      (emp: any) => emp.profileImage && emp.profileImage.includes(key),
    );

    if (!ownsImage) {
      throw new ForbiddenException(
        'Esta imagem não pertence a um funcionário da sua empresa',
      );
    }

    return true;
  }

  private async validateRestaurantOwnsImage(
    key: string,
    restaurantId: number,
  ): Promise<boolean> {
    const restaurant = await this.restaurantRepository.getById(restaurantId);

    if (!restaurant) {
      throw new NotFoundException('Restaurante não encontrado');
    }

    if (!restaurant.image || !restaurant.image.includes(key)) {
      throw new ForbiddenException(
        'Esta imagem não pertence ao seu restaurante',
      );
    }

    return true;
  }

  private async validateDishImageBelongsToRestaurant(
    key: string,
    restaurantId: number,
  ): Promise<boolean> {
    const dishes = await this.dishRepository.listByRestaurant(restaurantId);

    const ownsDish = dishes.some(
      (dish: any) => dish.image && dish.image.includes(key),
    );

    if (!ownsDish) {
      throw new ForbiddenException(
        'Esta imagem não pertence a um prato do seu restaurante',
      );
    }

    return true;
  }

  private async validateEmployeeOwnsImage(
    key: string,
    userId: number,
  ): Promise<boolean> {
    const user = await this.userRepository.getById(userId);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (!user.profileImage || !user.profileImage.includes(key)) {
      throw new ForbiddenException('Esta imagem não pertence ao funcionário');
    }

    return true;
  }
}
