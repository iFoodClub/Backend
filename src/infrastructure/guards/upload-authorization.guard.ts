import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserType } from '../../domain/models/user.model';

interface RequestUser {
  id: number;
  email: string;
  userType: UserType;
  companyId?: number;
  restaurantId?: number;
  employeeId?: number;
}

interface RequestWithUser extends Request {
  user: RequestUser;
  params: {
    folder?: string;
  };
  url: string;
}

/**
 * Guard para autorização de upload baseado no userType
 *
 * Regras:
 * - COMPANY: pode fazer upload/delete de 'companies' e 'users' (funcionários)
 * - RESTAURANT: pode fazer upload/delete de 'restaurants' e 'dishes'
 * - EMPLOYEE: pode fazer upload/delete apenas de 'users' (própria foto)
 *
 * NOVO: Infere automaticamente a pasta baseado na rota quando :folder não está presente
 * - /company/:id -> 'companies'
 * - /employee/:id -> 'users'
 * - /restaurant/:id -> 'restaurants'
 * - /dish/:id -> 'dishes'
 */
@Injectable()
export class UploadAuthorizationGuard implements CanActivate {
  /**
   * Infere a pasta (folder) baseado na URL da requisição
   */
  private inferFolderFromUrl(url: string): string | null {
    // Remove query params e trailing slashes
    const cleanUrl = url.split('?')[0].replace(/\/$/, '');

    // Mapa de rotas -> folders
    const routeToFolder: Record<string, string> = {
      '/company': 'companies',
      '/employee': 'users',
      '/restaurant': 'restaurants',
      '/dish': 'dishes',
      '/user': 'users',
    };

    // Verifica qual rota está na URL
    for (const [route, folder] of Object.entries(routeToFolder)) {
      if (cleanUrl.includes(route)) {
        return folder;
      }
    }

    return null;
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    if (!user.userType) {
      throw new ForbiddenException('Tipo de usuário não identificado');
    }

    // Tenta pegar folder do parâmetro da URL (ex: /upload/image/:folder)
    let folder = request.params.folder;

    // Se não encontrou, infere da rota (ex: /company/:id -> 'companies')
    if (!folder) {
      folder = this.inferFolderFromUrl(request.url);
    }

    // Se ainda não encontrou, só permite passar (para rotas que não precisam de validação de folder)
    if (!folder) {
      return true; // Deixa passar - outras guards ou controllers vão validar
    }

    // Mapa de permissões: userType -> pastas permitidas
    const permissions: Record<UserType, string[]> = {
      [UserType.COMPANY]: ['companies', 'users'], // Empresa e funcionários
      [UserType.RESTAURANT]: ['restaurants', 'dishes'], // Restaurante e pratos
      [UserType.EMPLOYEE]: ['users'], // Apenas própria foto
    };

    const allowedFolders = permissions[user.userType];

    if (!allowedFolders) {
      throw new ForbiddenException(
        `Tipo de usuário '${user.userType}' não reconhecido`,
      );
    }

    if (!allowedFolders.includes(folder)) {
      throw new ForbiddenException(
        `Usuários do tipo '${user.userType}' não podem fazer upload em '${folder}'. ` +
          `Pastas permitidas: ${allowedFolders.join(', ')}`,
      );
    }

    return true;
  }
}
