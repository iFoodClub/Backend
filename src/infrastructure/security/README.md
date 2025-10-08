# Proteções de Segurança - SQL Injection

Este módulo implementa proteções robustas contra SQL Injection e outras vulnerabilidades de segurança.

## Componentes

### 1. SqlInjectionGuard
- **Localização**: `src/infrastructure/security/sql-injection.guard.ts`
- **Função**: Intercepta todas as requisições e valida parâmetros contra padrões de SQL injection
- **Uso**: Aplicado globalmente ou em controllers específicos

### 2. InputValidationPipe
- **Localização**: `src/infrastructure/security/input-validation.pipe.ts`
- **Função**: Sanitiza e valida dados de entrada
- **Uso**: Aplicado em parâmetros de controllers

### 3. Validation Decorators
- **Localização**: `src/infrastructure/security/validation.decorators.ts`
- **Função**: Decorators para validação específica de tipos de dados
- **Decorators disponíveis**:
  - `@SanitizeInput()`: Sanitiza strings
  - `@ValidateId()`: Valida IDs numéricos
  - `@ValidateEmail()`: Valida formato de email

### 4. SequelizeSecurityConfig
- **Localização**: `src/infrastructure/security/sequelize-security.config.ts`
- **Função**: Configurações de segurança para o Sequelize
- **Recursos**:
  - Hooks para validação de queries
  - Sanitização de parâmetros
  - Logging de segurança

## Como Usar

### 1. Aplicar Guard Globalmente
```typescript
// app.module.ts
import { SecurityModule } from './infrastructure/security/security.module';

@Module({
  imports: [SecurityModule],
  // ...
})
export class AppModule {}
```

### 2. Usar em Controllers
```typescript
import { Controller, Get, UseGuards, UsePipes } from '@nestjs/common';
import { SqlInjectionGuard } from '../infrastructure/security/sql-injection.guard';
import { InputValidationPipe } from '../infrastructure/security/input-validation.pipe';
import { SanitizeInput, ValidateId } from '../infrastructure/security/validation.decorators';

@Controller('users')
@UseGuards(SqlInjectionGuard)
export class UserController {
  
  @Get(':id')
  async getUser(@ValidateId('id') id: number) {
    // ID já validado como número
    return this.userService.findById(id);
  }
  
  @Get('search')
  async searchUsers(@SanitizeInput('query') query: string) {
    // Query já sanitizada
    return this.userService.search(query);
  }
}
```

### 3. Validação em Repositórios
```typescript
import { SequelizeSecurityConfig } from '../security/sequelize-security.config';

export class UserRepository {
  async findByEmail(email: string) {
    // Sanitiza o email antes da consulta
    const sanitizedEmail = SequelizeSecurityConfig.sanitizeString(email);
    return await this.userEntity.findOne({ where: { email: sanitizedEmail } });
  }
}
```

## Padrões Detectados

O sistema detecta e bloqueia os seguintes padrões:

### SQL Injection
- `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `DROP`, `CREATE`, `ALTER`
- `UNION SELECT`
- `OR 1=1`, `AND 1=1`
- Comentários SQL (`--`, `/* */`)
- Funções perigosas (`EXEC`, `SCRIPT`, `WAITFOR DELAY`)

### XSS
- Tags `<script>`
- URLs `javascript:`
- Event handlers (`onclick`, `onload`, etc.)

### Caracteres Perigosos
- Aspas simples e duplas
- Caracteres de controle
- Sequências de escape

## Logs de Segurança

Em desenvolvimento, o sistema registra:
- Tentativas de SQL injection
- Queries executadas
- Parâmetros suspeitos

Em produção, apenas erros críticos são logados.

## Configuração

As configurações são aplicadas automaticamente no `database.provider.ts`:

```typescript
// Aplica configurações de segurança
SequelizeSecurityConfig.applySecurityConfig(sequelize);
```

## Testes de Segurança

Para testar as proteções:

```bash
# Tentativa de SQL injection
curl "http://localhost:3000/users?name=' OR 1=1 --"

# Tentativa de XSS
curl "http://localhost:3000/users" -d '{"name": "<script>alert(1)</script>"}'

# Ambas devem retornar erro 400
```

## Monitoramento

Configure alertas para:
- Múltiplas tentativas de SQL injection
- Padrões suspeitos
- Erros de validação frequentes

