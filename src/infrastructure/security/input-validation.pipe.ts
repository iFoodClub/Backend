import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class InputValidationPipe implements PipeTransform {
  transform(value: any) {
    // Para objetos, sanitiza recursivamente mas preserva campos importantes
    if (typeof value === 'object' && value !== null) {
      const sanitized = {};
      for (const key in value) {
        if (value.hasOwnProperty(key)) {
          // Preserva campos importantes sem sanitização
          const preservedFields = ['email', 'password', 'oldPassword', 'newPassword', 'name', 'cpf', 'cnpj', 'profileImage'];
          if (preservedFields.includes(key)) {
            sanitized[key] = value[key]; // Preserva valor original
          } else if (key === 'employee' || key === 'company' || key === 'restaurant') {
            // Para objetos aninhados, preserva também mas valida internamente
            sanitized[key] = this.transform(value[key]);
          } else {
            sanitized[key] = this.transform(value[key]);
          }
        }
      }
      return sanitized;
    }

    // Sanitiza strings removendo caracteres perigosos (mas não emails/senhas que já foram tratados acima)
    if (typeof value === 'string') {
      // Validação de emails: não sanitiza, apenas valida padrões SQL suspeitos
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (emailPattern.test(value)) {
        // Email válido, apenas verifica padrões SQL extremamente suspeitos sem sanitizar
        const extremeSqlPattern = /['";]\s*(OR|AND|UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|SCRIPT|--|\/\*)/i;
        if (extremeSqlPattern.test(value)) {
          throw new BadRequestException('Entrada contém padrões não permitidos');
        }
        return value; // Retorna email original sem sanitização
      }

      // Para senhas: não sanitiza, apenas valida padrões SQL suspeitos
      // Se parece com uma senha (6-128 caracteres com caracteres normais)
      const passwordPattern = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
      if (passwordPattern.test(value) && value.length >= 6 && value.length <= 128) {
        // Parece uma senha válida, apenas verifica padrões SQL extremamente suspeitos
        const extremeSqlPattern = /['";]\s*(OR|AND|UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|SCRIPT|--|\/\*)/i;
        if (extremeSqlPattern.test(value)) {
          throw new BadRequestException('Entrada contém padrões não permitidos');
        }
        return value; // Retorna senha original sem sanitização
      }

      // Para outras strings: sanitiza removendo apenas caracteres de controle (não aspas normais)
      // Remove apenas caracteres de controle, não caracteres como @, ., etc
      const controlChars = /[\x00\x1a\n\r\t\b\f\v]/g;
      const sanitized = value.replace(controlChars, '');
      
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

    return value;
  }
}

