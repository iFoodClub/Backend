/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
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
