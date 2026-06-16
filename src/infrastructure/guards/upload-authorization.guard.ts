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
 * Guard para autorização de upload baseado no userType.
 *
 * Mapa atual de pastas do Blob Storage:
 * - COMPANY: perfis, funcionarios
 * - RESTAURANT: perfis, pratos
 * - EMPLOYEE: funcionarios
 */
@Injectable()
export class UploadAuthorizationGuard implements CanActivate {
  /**
   * Infere a pasta (folder) baseado na URL da requisição
   * Case-insensitive para funcionar com /dish e /Dish
   */
  private inferFolderFromUrl(url: string): string | null {
    // Remove query params e trailing slashes, converte para minúsculo
    const cleanUrl = url.split('?')[0].replace(/\/$/, '').toLowerCase();

    const routeToFolder: Record<string, string> = {
      '/company': 'perfis',
      '/employee': 'funcionarios',
      '/restaurant': 'perfis',
      '/dish': 'pratos',
      '/user': 'funcionarios',
    };

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

    let folder = request.params.folder;

    if (!folder) {
      folder = this.inferFolderFromUrl(request.url);
    }

    if (!folder) {
      return true;
    }

    const permissions: Record<UserType, string[]> = {
      [UserType.COMPANY]: ['perfis', 'funcionarios'],
      [UserType.RESTAURANT]: ['perfis', 'pratos'],
      [UserType.EMPLOYEE]: ['funcionarios'],
    };

    const allowedFolders = permissions[user.userType];

    if (!allowedFolders) {
      throw new ForbiddenException(
        `Tipo de usuário '${user.userType}' não reconhecido`,
      );
    }

    if (!allowedFolders.includes(folder)) {
      throw new ForbiddenException(
        `Usuários do tipo '${user.userType}' não podem fazer alterações em '${folder}'. ` +
        `Pastas permitidas: ${allowedFolders.join(', ')}`,
      );
    }

    return true;
  }
}
