/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { GetUserByEmailService } from './get-byemail.use-cases';
import { UserInterface } from '../../domain/models/user.model';
import { CompanyRepository } from 'src/infrastructure/database/repositories/company.repository';
import { RestaurantRepository } from 'src/infrastructure/database/repositories/restaurant.repository';
import { EmployeeRepository } from 'src/infrastructure/database/repositories/employee.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly GetUserByEmailService: GetUserByEmailService,
    private readonly companyRepository: CompanyRepository,
    private readonly restaurantRepository: RestaurantRepository,
    private readonly employeeRepository: EmployeeRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(
    email: string,
    password: string,
  ): Promise<{ token: string; userDetails: any }> {
    const user = await this.GetUserByEmailService.execute(email);

    if (!user) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    // 🔧 Busca os IDs das entidades relacionadas baseado no userType
    let companyId: number | undefined;
    let restaurantId: number | undefined;
    let employeeId: number | undefined;

    // 🐛 DEBUG: Log antes de buscar IDs
    console.log('🔍 [Login] Buscando IDs para user:', {
      userId: user.id,
      userType: user.userType,
    });

    switch (user.userType) {
      case 'company': {
        const company = await this.companyRepository.findByUserId(user.id);
        companyId = company?.id;
        console.log('   - Company encontrada:', company?.id);
        break;
      }
      case 'restaurant': {
        const restaurant = await this.restaurantRepository.findByUserId(
          user.id,
        );
        restaurantId = restaurant?.id;
        console.log('   - Restaurant encontrado:', restaurant?.id);
        console.log('   - Restaurant completo:', restaurant);
        break;
      }
      case 'employee': {
        const employee = await this.employeeRepository.findByUserId(user.id);
        employeeId = employee?.id;
        companyId = employee?.companyId; // Employee também precisa do companyId
        console.log('   - Employee encontrado:', employee?.id);
        break;
      }
    }

    const payload = {
      sub: user.id,
      email: user.email,
      userType: user.userType,
      companyId,
      restaurantId,
      employeeId,
    };

    // 🐛 DEBUG: Log do payload que será colocado no token
    console.log('🔍 [Login] Payload do token JWT:');
    console.log('   ', JSON.stringify(payload, null, 2));

    const token = this.jwtService.sign(payload);
    const userDetails = await this.getUserDetails(user);

    return { token, userDetails };
  }

  async validateToken(token: string): Promise<number> {
    try {
      const payload = await this.jwtService.verify(token);
      return payload.sub;
    } catch (error) {
      throw new UnauthorizedException('Sessão inválida ou expirada');
    }
  }

  logout(_token: string): void {
    // Com JWT, não precisamos mais gerenciar sessões ativamente
    // O token expirará automaticamente
    return;
  }

  private async getUserDetails(user: UserInterface) {
    switch (user.userType) {
      case 'company': {
        const company = await this.companyRepository.findByUserId(user.id);
        return {
          id: user.id,
          email: user.email,
          userType: user.userType,
          profileImage: user.profileImage,
          name: company.name,
          password: undefined, // Remove a senha dos detalhes retornados
          company,
        };
      }
      case 'employee': {
        const employee = await this.employeeRepository.findByUserId(user.id);
        return {
          id: user.id,
          email: user.email,
          userType: user.userType,
          profileImage: user.profileImage,
          name: employee.name,
          password: undefined,
          employee,
        };
      }
      case 'restaurant': {
        const restaurant = await this.restaurantRepository.findByUserId(
          user.id,
        );
        return {
          id: user.id,
          email: user.email,
          userType: user.userType,
          profileImage: user.profileImage,
          name: restaurant.name,
          password: undefined,
          restaurant,
        };
      }
      default:
        return {
          ...user,
          password: undefined,
        };
    }
  }

  // Método auxiliar para hash de senha (use ao criar/atualizar usuários)
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }
}
