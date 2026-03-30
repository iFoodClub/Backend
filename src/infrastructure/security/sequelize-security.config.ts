import { Sequelize } from 'sequelize';

/**
 * Configurações de segurança para o Sequelize
 */
export class SequelizeSecurityConfig {
  /**
   * Aplica configurações de segurança ao Sequelize
   */
  static applySecurityConfig(sequelize: Sequelize): void {
    // Desabilita logging de queries em produção para evitar vazamento de informações
    if (process.env.NODE_ENV === 'production') {
      (sequelize as any).options.logging = false;
    }

    const useSsl = process.env.DB_SSL !== 'false';
    const dialectOpts: Record<string, unknown> = {
      ...(sequelize as any).options.dialectOptions,
      prepare: true,
    };
    if (useSsl) {
      dialectOpts.ssl = { require: true, rejectUnauthorized: false };
    }
    (sequelize as any).options.dialectOptions = dialectOpts;

    // Hook para sanitizar queries antes da execução
    sequelize.addHook('beforeQuery', (options: any) => {
      // Verifica se a query contém padrões suspeitos
      if (options.sql) {
        const sqlInjectionPatterns = [
          /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
          /(--|\/\*|\*\/)/,
          /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
          /(UNION\s+SELECT)/i
        ];

        for (const pattern of sqlInjectionPatterns) {
          if (pattern.test(options.sql)) {
            throw new Error('Query contém padrões suspeitos de SQL injection');
          }
        }
      }
    });

    // Hook para log de tentativas de SQL injection
    sequelize.addHook('beforeQuery', (options: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[SQL Security] Query executada: ${options.sql?.substring(0, 100)}...`);
      }
    });
  }

  /**
   * Valida parâmetros de entrada para queries
   */
  static validateQueryParams(params: any[]): void {
    for (const param of params) {
      if (typeof param === 'string') {
        // Verifica padrões de SQL injection em strings
        const sqlInjectionPatterns = [
          /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
          /(--|\/\*|\*\/)/,
          /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
          /(UNION\s+SELECT)/i
        ];

        for (const pattern of sqlInjectionPatterns) {
          if (pattern.test(param)) {
            throw new Error('Parâmetro contém padrões suspeitos de SQL injection');
          }
        }
      }
    }
  }

  /**
   * Sanitiza strings para uso em queries
   */
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') {
      return input;
    }

    return input
      .replace(/['";\\x00\\x1a\\n\\r\\t\\b\\f\\v]/g, '') // Remove caracteres perigosos
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }
}

