import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
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
    folder: string;
  };
}

/**
 * Guard para autorização de upload baseado no userType
 *
 * Regras:
 * - COMPANY: pode fazer upload/delete de 'companies' e 'users' (funcionários)
 * - RESTAURANT: pode fazer upload/delete de 'restaurants' e 'dishes'
 * - EMPLOYEE: pode fazer upload/delete apenas de 'users' (própria foto)
 */
@Injectable()
export class UploadAuthorizationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    const { folder } = request.params;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    if (!user.userType) {
      throw new ForbiddenException('Tipo de usuário não identificado');
    }

    if (!folder) {
      throw new BadRequestException('Pasta (folder) não especificada');
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
