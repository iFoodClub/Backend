/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

function jwtFromRequest(req: { headers?: { authorization?: string } }): string | null {
  const auth = req.headers?.authorization;
  if (!auth || typeof auth !== 'string') {
    return null;
  }
  const trimmed = auth.trim();
  if (trimmed.toLowerCase().startsWith('bearer ')) {
    return trimmed.slice(7).trim();
  }
  // Alguns clientes enviam só o JWT no header Authorization (sem prefixo Bearer)
  const parts = trimmed.split('.');
  if (parts.length === 3) {
    return trimmed;
  }
  return null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  validate(payload: any) {
    // 🐛 DEBUG: Log para ver o que está vindo no token
    console.log('🔍 [JwtStrategy] Payload extraído do token:');
    console.log('   ', JSON.stringify(payload, null, 2));

    const user = {
      id: payload.sub,
      email: payload.email,
      userType: payload.userType,
      companyId: payload.companyId,
      restaurantId: payload.restaurantId,
      employeeId: payload.employeeId,
    };

    console.log('🔍 [JwtStrategy] User retornado:');
    console.log('   ', JSON.stringify(user, null, 2));

    return user;
  }
}
