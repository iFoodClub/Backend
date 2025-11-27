import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserType } from '../../domain/models/user.model';

/**
 * User Ownership Guard
 *
 * Valida se o usuário tem permissão para modificar/deletar o próprio perfil.
 *
 * REGRAS:
 * - Usuário só pode modificar/deletar seu próprio perfil (user.id === params.id)
 * - Futuramente, admins poderão modificar qualquer usuário
 *
 * IMPORTANTE: Este guard DEVE vir DEPOIS do JwtAuthGuard
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
  params: {
    id?: string;
  };
}

@Injectable()
export class UserOwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    const { id } = request.params;

    console.log('[UserOwnershipGuard] Validando propriedade do usuário');
    console.log('   - Usuário logado ID:', user?.id);
    console.log('   - ID do parâmetro:', id);

    // Validação básica
    if (!user) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    if (!id) {
      throw new ForbiddenException('ID do usuário não fornecido');
    }

    const targetUserId = parseInt(id, 10);

    if (user.id !== targetUserId) {
      console.log(
        'ACESSO NEGADO: Usuário tentando modificar perfil de outro usuário',
      );
      console.log(`   - Logado: ${user.id} (${user.userType})`);
      console.log(`   - Tentando modificar: ${targetUserId}`);

      throw new ForbiddenException(
        'Você não tem permissão para modificar/deletar este usuário. ' +
          'Você só pode modificar seu próprio perfil.',
      );
    }

    console.log('ACESSO PERMITIDO: Usuário modificando próprio perfil');
    return true;
  }
}
