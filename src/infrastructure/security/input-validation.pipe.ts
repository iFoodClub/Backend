import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class InputValidationPipe implements PipeTransform {
  transform(value: any) {
    // Sanitiza strings removendo caracteres perigosos
    if (typeof value === 'string') {
      // Remove caracteres que podem ser usados em SQL injection
      const dangerousChars = /['";\\x00\\x1a\\n\\r\\t\\b\\f\\v]/g;
      const sanitized = value.replace(dangerousChars, '');
      
      // Verifica se a string contém padrões suspeitos de SQL injection
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
        /(UPDATE\s+SET)/i
      ];

      for (const pattern of sqlInjectionPatterns) {
        if (pattern.test(sanitized)) {
          throw new BadRequestException('Entrada contém caracteres ou padrões não permitidos');
        }
      }

      return sanitized;
    }

    // Para objetos, sanitiza recursivamente
    if (typeof value === 'object' && value !== null) {
      const sanitized = {};
      for (const key in value) {
        if (value.hasOwnProperty(key)) {
          sanitized[key] = this.transform(value[key]);
        }
      }
      return sanitized;
    }

    return value;
  }
}

