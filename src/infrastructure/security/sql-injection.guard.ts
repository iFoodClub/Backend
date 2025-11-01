import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class SqlInjectionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Verifica query parameters
    if (request.query) {
      this.validateInput(request.query, 'query');
    }
    
    // Verifica body parameters
    if (request.body) {
      this.validateInput(request.body, 'body');
    }
    
    // Verifica route parameters (IDs numéricos são permitidos)
    if (request.params) {
      this.validateRouteParams(request.params);
    }

    return true;
  }

  /**
   * Valida parâmetros de rota (permite IDs numéricos simples)
   */
  private validateRouteParams(params: any): void {
    for (const [key, value] of Object.entries(params)) {
      const paramValue = String(value);
      
      // Permite IDs numéricos simples
      if (/^\d+$/.test(paramValue)) {
        continue;
      }
      
      // Para valores não numéricos, aplica validação rigorosa
      this.validateStringValue(paramValue);
    }
  }

  /**
   * Valida inputs gerais (body, query)
   */
  private validateInput(input: any, type: 'body' | 'query'): void {
    // Se for objeto, valida recursivamente
    if (typeof input === 'object' && input !== null) {
      if (Array.isArray(input)) {
        input.forEach(item => this.validateInput(item, type));
      } else {
        for (const value of Object.values(input)) {
          this.validateInput(value, type);
        }
      }
      return;
    }
    
    // Se for string, valida diretamente
    if (typeof input === 'string') {
      this.validateStringValue(input);
    }
  }

  /**
   * Valida valor de string contra padrões de SQL injection
   */
  private validateStringValue(value: string): void {
    // Validação de emails: permite caracteres comuns em emails antes de outras validações
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (emailPattern.test(value)) {
      // Email válido, apenas verifica padrões SQL extremamente suspeitos
      const extremeSqlPattern = /['";]\s*(OR|AND|UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|SCRIPT|--|\/\*)/i;
      if (extremeSqlPattern.test(value)) {
        throw new BadRequestException('Tentativa de SQL injection detectada');
      }
      return; // Email válido, permite continuar
    }

    // Validação de senhas: permite caracteres alfanuméricos e alguns especiais comuns
    // Se parece com uma senha (só letras, números e alguns caracteres especiais), valida menos rigorosamente
    const passwordPattern = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
    if (passwordPattern.test(value) && value.length >= 6 && value.length <= 128) {
      // Parece uma senha válida, apenas verifica padrões SQL extremamente suspeitos
      const extremeSqlPattern = /['";]\s*(OR|AND|UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|SCRIPT|--|\/\*)/i;
      if (extremeSqlPattern.test(value)) {
        throw new BadRequestException('Tentativa de SQL injection detectada');
      }
      // Não bloqueia caracteres normais de senha
      return;
    }

    // Padrões de SQL injection mais comuns (para outros tipos de input)
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
      if (pattern.test(value)) {
        throw new BadRequestException('Tentativa de SQL injection detectada');
      }
    }

    // Verifica apenas caracteres de controle (não caracteres normais como @, ., etc)
    const dangerousChars = /[\x00\x1a\n\r\t\b\f\v]/;
    if (dangerousChars.test(value)) {
      throw new BadRequestException('Caracteres perigosos detectados na entrada');
    }

    // Detecta aspas simples ou duplas apenas quando aparecem em padrões suspeitos
    const suspiciousQuotePattern = /['"]\s*(OR|AND|UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|SCRIPT)/i;
    if (suspiciousQuotePattern.test(value)) {
      throw new BadRequestException('Tentativa de SQL injection detectada');
    }
  }
}

