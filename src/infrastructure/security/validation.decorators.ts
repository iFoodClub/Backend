import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

/**
 * Decorator para sanitizar e validar parâmetros de entrada
 */
export const SanitizeInput = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const value = request.body[data] || request.query[data] || request.params[data];
    
    if (typeof value === 'string') {
      // Remove caracteres perigosos
      const sanitized = value
        .replace(/['";\\x00\\x1a\\n\\r\\t\\b\\f\\v]/g, '')
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
        .replace(/javascript:/gi, '') // Remove javascript: URLs
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .trim();
      
      // Verifica padrões de SQL injection
      const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
        /(--|\/\*|\*\/)/,
        /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
        /(UNION\s+SELECT)/i
      ];

      for (const pattern of sqlPatterns) {
        if (pattern.test(sanitized)) {
          throw new BadRequestException('Entrada contém padrões não permitidos');
        }
      }

      return sanitized;
    }
    
    return value;
  },
);

/**
 * Decorator para validar IDs numéricos
 */
export const ValidateId = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const id = request.params[data] || request.query[data];
    
    if (id && !/^\d+$/.test(id)) {
      throw new BadRequestException('ID deve ser um número válido');
    }
    
    return id ? parseInt(id, 10) : undefined;
  },
);

/**
 * Decorator para validar emails
 */
export const ValidateEmail = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const email = request.body[data] || request.query[data];
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException('Email deve ter um formato válido');
    }
    
    return email;
  },
);

