/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 🐛 DEBUG
    console.log('🔍 [JwtAuthGuard] Verificando autenticação');
    console.log('   - URL:', request.url);
    console.log('   - Method:', request.method);
    console.log(
      '   - Authorization Header:',
      request.headers.authorization || 'NÃO ENVIADO ❌',
    );

    return super.canActivate(context) as Promise<boolean>;
  }

  handleRequest(err: any, user: any) {
    console.log('🔍 [JwtAuthGuard] handleRequest');
    console.log('   - Erro:', err);
    console.log('   - User:', user);

    if (err || !user) {
      console.log('   ❌ BLOQUEADO - Sem usuário ou com erro');
      throw err || new UnauthorizedException('Acesso não autorizado');
    }

    console.log('   ✅ AUTENTICADO');
    return user;
  }
}
