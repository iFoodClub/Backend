import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class SqlInjectionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Verifica query parameters
    if (request.query) {
      this.validateInput(request.query);
    }
    
    // Verifica body parameters
    if (request.body) {
      this.validateInput(request.body);
    }
    
    // Verifica route parameters
    if (request.params) {
      this.validateInput(request.params);
    }

    return true;
  }

  private validateInput(input: any): void {
    const inputString = JSON.stringify(input);
    
    // Padrões de SQL injection mais comuns
    const sqlInjectionPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /(--|\/\*|\*\/)/,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
      /(\b(OR|AND)\s+'.*'\s*=\s*'.*')/i,
      /(\b(OR|AND)\s+".*"\s*=\s*".*")/i,
      /(UNION\s+SELECT)/i,
      /(DROP\s+TABLE)/i,
      /(DELETE\s+FROM)/i,
      /(INSERT\s+INTO)/i,
      /(UPDATE\s+SET)/i,
      /(EXEC\s+)/i,
      /(SCRIPT\s+)/i,
      /(WAITFOR\s+DELAY)/i,
      /(BENCHMARK\s*\()/i,
      /(SLEEP\s*\()/i,
      /(CHAR\s*\()/i,
      /(ASCII\s*\()/i,
      /(ORD\s*\()/i,
      /(MID\s*\()/i,
      /(SUBSTRING\s*\()/i,
      /(LENGTH\s*\()/i,
      /(CONCAT\s*\()/i,
      /(GROUP_CONCAT\s*\()/i,
      /(INFORMATION_SCHEMA)/i,
      /(SYS\.)/i,
      /(PG_)/i,
      /(\\x[0-9a-fA-F]{2})/i, // Hex encoding
      /(\\u[0-9a-fA-F]{4})/i, // Unicode encoding
      /(\\0[0-7]{1,3})/i, // Octal encoding
      /(\\[0-9]{1,3})/i, // Octal encoding
    ];

    for (const pattern of sqlInjectionPatterns) {
      if (pattern.test(inputString)) {
        throw new BadRequestException('Tentativa de SQL injection detectada');
      }
    }

    // Verifica caracteres perigosos
    const dangerousChars = /['";\\x00\\x1a\\n\\r\\t\\b\\f\\v]/;
    if (dangerousChars.test(inputString)) {
      throw new BadRequestException('Caracteres perigosos detectados na entrada');
    }
  }
}

