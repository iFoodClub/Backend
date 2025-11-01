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

/**
 * 🎓 TUTORIAL: Upload Ownership Guard
 *
 * Este guard valida se o usuário tem PROPRIEDADE sobre a entidade que está tentando modificar.
 *
 * FLUXO:
 * 1. Request chega com token JWT (já validado pelo JwtAuthGuard)
 * 2. UploadAuthorizationGuard valida se o userType pode acessar a pasta
 * 3. UploadOwnershipGuard valida se a entidade PERTENCE ao usuário
 *
 * EXEMPLOS:
 * - Empresa A não pode alterar logo da Empresa B
 * - Empresa A não pode alterar foto de funcionário da Empresa B
 * - Restaurante A não pode alterar pratos do Restaurante B
 * - Funcionário só pode alterar sua própria foto
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
    // Injetando os repositories do Sequelize
    private readonly companyRepository: CompanyRepository,
    private readonly employeeRepository: EmployeeRepository,
    private readonly restaurantRepository: RestaurantRepository,
    private readonly dishRepository: DishRepository,
  ) {}

  /**
   * 🔍 Infere a pasta (folder) a partir da URL
   * Exemplo: /dish/123 -> "dishes"
   * Exemplo: /Dish/123 -> "dishes" (case-insensitive)
   */
  private inferFolderFromUrl(url: string): string | null {
    const urlLower = url.toLowerCase(); // Converter para minúsculo
    const urlMap: Record<string, string> = {
      '/company': 'companies',
      '/employee': 'users',
      '/restaurant': 'restaurants',
      '/dish': 'dishes',
    };

    for (const [route, folder] of Object.entries(urlMap)) {
      if (urlLower.includes(route)) {
        return folder;
      }
    }

    return null;
  }

  /**
   * Método principal que valida se o usuário pode executar a ação
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    let { folder } = request.params;
    const { id } = request.params;
    const { key } = request.body || {};
    const url = request.url;

    console.log('🛡️ [UploadOwnershipGuard] Guard executado!');
    console.log('   - URL:', url);
    console.log('   - Method:', request.method);
    console.log('   - Params:', request.params);
    console.log('   - folder (params):', folder);
    console.log('   - id (params):', id);
    console.log('   - key (body):', key);

    // Validação básica
    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // 🎯 CASO 1: DELETE de imagem (baseado na key do S3)
    // Exemplo: DELETE /upload/image com body: { key: "companies/123.jpg" }
    if (key && request.method === 'DELETE') {
      console.log('   ➡️ Caso 1: DELETE de imagem com key');
      return this.validateDeleteOwnership(key, user);
    }

    // 🔍 Inferir folder da URL se não estiver nos parâmetros
    if (!folder && url) {
      folder = this.inferFolderFromUrl(url);
      console.log('   ➡️ Folder inferido da URL:', folder);
    }

    // 🎯 CASO 2: UPDATE/DELETE de entidade (baseado no ID)
    // Exemplo: PATCH /companies/1 ou DELETE /dish/123
    if (id && folder) {
      console.log('   ➡️ Caso 2: UPDATE/DELETE com ID e folder');
      console.log('   - folder:', folder);
      console.log('   - entityId:', id);
      return this.validateUpdateOwnership(folder, parseInt(id), user);
    }

    // 🎯 CASO 3: POST genérico de upload sem ID específico
    // Permitir (será validado no controller posteriormente)
    console.log('   ➡️ Caso 3: POST genérico - PERMITINDO sem validação');
    console.log('   ⚠️ ATENÇÃO: Retornando true sem validar!');
    return true;
  }

  /**
   * 📝 MÉTODO 1: Valida DELETE de imagem
   *
   * Garante que o usuário só pode deletar imagens que pertencem a ele
   */
  private async validateDeleteOwnership(
    key: string,
    user: RequestUser,
  ): Promise<boolean> {
    // Extrai a pasta da key: "companies/123.jpg" → "companies"
    const folder = key.split('/')[0];

    switch (user.userType) {
      case UserType.COMPANY:
        if (folder === 'companies') {
          // ✅ Empresa deletando logo da própria empresa
          return this.validateCompanyOwnsImage(key, user.companyId);
        }
        if (folder === 'users') {
          // ✅ Empresa deletando foto de um dos seus funcionários
          return this.validateEmployeeImageBelongsToCompany(
            key,
            user.companyId,
          );
        }
        break;

      case UserType.RESTAURANT:
        if (folder === 'restaurants') {
          // ✅ Restaurante deletando logo do próprio restaurante
          return this.validateRestaurantOwnsImage(key, user.restaurantId);
        }
        if (folder === 'dishes') {
          // ✅ Restaurante deletando foto de um dos seus pratos
          return this.validateDishImageBelongsToRestaurant(
            key,
            user.restaurantId,
          );
        }
        break;

      case UserType.EMPLOYEE:
        if (folder === 'users') {
          // ✅ Funcionário deletando sua própria foto
          return this.validateEmployeeOwnsImage(key, user.employeeId);
        }
        break;
    }

    throw new ForbiddenException('Sem permissão para deletar esta imagem');
  }

  /**
   * 📝 MÉTODO 2: Valida UPDATE de entidade
   *
   * Garante que o usuário só pode atualizar entidades que pertencem a ele
   */
  private async validateUpdateOwnership(
    folder: string,
    entityId: number,
    user: RequestUser,
  ): Promise<boolean> {
    switch (user.userType) {
      case UserType.COMPANY:
        if (folder === 'companies') {
          // ✅ Empresa atualizando sua própria empresa
          if (entityId !== user.companyId) {
            throw new ForbiddenException(
              'Você só pode atualizar sua própria empresa',
            );
          }
          return true;
        }

        if (folder === 'users' || folder === 'employees') {
          // ✅ Empresa atualizando funcionário que pertence a ela
          const employee = await this.employeeRepository.getById(entityId);

          if (!employee) {
            throw new NotFoundException('Funcionário não encontrado');
          }

          if (employee.companyId !== user.companyId) {
            throw new ForbiddenException(
              'Este funcionário não pertence à sua empresa',
            );
          }
          return true;
        }
        break;

      case UserType.RESTAURANT:
        if (folder === 'restaurants') {
          // ✅ Restaurante atualizando seu próprio restaurante
          if (entityId !== user.restaurantId) {
            throw new ForbiddenException(
              'Você só pode atualizar seu próprio restaurante',
            );
          }
          return true;
        }

        if (folder === 'dishes') {
          // ✅ Restaurante atualizando prato que pertence a ele

          // 🐛 DEBUG: Log para identificar o problema
          console.log('🔍 [UploadOwnershipGuard] Validando ownership de dish:');
          console.log('   - entityId (dish ID):', entityId);
          console.log('   - user.restaurantId:', user.restaurantId);
          console.log('   - user.userType:', user.userType);
          console.log('   - user completo:', JSON.stringify(user, null, 2));

          if (!user.restaurantId) {
            throw new ForbiddenException(
              '❌ restaurantId não encontrado no token JWT. Faça login novamente.',
            );
          }

          const dish = await this.dishRepository.getById(entityId);

          if (!dish) {
            throw new NotFoundException('Prato não encontrado');
          }

          console.log('   - dish.restaurantId:', dish.restaurantId);
          console.log(
            '   - Comparação:',
            dish.restaurantId,
            '!==',
            user.restaurantId,
          );

          if (dish.restaurantId !== user.restaurantId) {
            throw new ForbiddenException(
              `Este prato não pertence ao seu restaurante. Prato pertence ao restaurante ${dish.restaurantId}, você é do restaurante ${user.restaurantId}`,
            );
          }
          return true;
        }
        break;

      case UserType.EMPLOYEE:
        if (folder === 'users' || folder === 'employees') {
          // ✅ Funcionário atualizando seu próprio perfil
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

  /**
   * Valida se a imagem da empresa pertence ao usuário
   */
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

  /**
   * Valida se a imagem do funcionário pertence à empresa do usuário
   */
  private async validateEmployeeImageBelongsToCompany(
    key: string,
    companyId: number,
  ): Promise<boolean> {
    // Busca todos os funcionários da empresa com imagem de perfil
    const employees =
      await this.employeeRepository.listByCompanyWithProfileImage(companyId);

    // Verifica se algum funcionário tem essa imagem
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

  /**
   * Valida se a imagem do restaurante pertence ao usuário
   */
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

  /**
   * Valida se a imagem do prato pertence ao restaurante do usuário
   */
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

  /**
   * Valida se a imagem pertence ao próprio funcionário
   */
  private async validateEmployeeOwnsImage(
    key: string,
    employeeId: number,
  ): Promise<boolean> {
    const employee = await this.employeeRepository.getById(employeeId);

    if (!employee) {
      throw new NotFoundException('Funcionário não encontrado');
    }

    // Busca o usuário associado ao funcionário
    const user = await this.employeeRepository.getByUserId(employee.userId);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Aqui você precisa adaptar para pegar o profileImage do user
    // Como o método getById não retorna o user com profileImage,
    // você pode precisar criar um método específico ou ajustar
    throw new ForbiddenException('Você só pode deletar sua própria foto');
  }
}
