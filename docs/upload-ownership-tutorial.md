# 🎓 Tutorial: Implementando Upload Ownership Guard

## 📚 Índice
1. [O que é o UploadOwnershipGuard](#o-que-é)
2. [Como Funciona](#como-funciona)
3. [Passo a Passo de Implementação](#passo-a-passo)
4. [Como Usar nos Controllers](#como-usar)
5. [Testando](#testando)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 O que é o UploadOwnershipGuard?

É um **Guard do NestJS** que valida se o usuário tem **propriedade** sobre a entidade que ele está tentando modificar.

### Problema que resolve:

❌ **SEM o guard:**
```
Empresa A → Upload imagem → S3 ✅
Empresa A → PATCH /companies/2 → Empresa B modificada! 😱
```

✅ **COM o guard:**
```
Empresa A → Upload imagem → S3 ✅
Empresa A → PATCH /companies/2 → 403 Forbidden! 🔒
                                  "Você só pode atualizar sua própria empresa"
```

---

## ⚙️ Como Funciona?

### Fluxo de Execução:

```
1. Request chega com JWT token
   ↓
2. JwtAuthGuard valida autenticação
   ✅ Token válido
   ↓
3. UploadAuthorizationGuard valida userType
   ✅ COMPANY pode acessar pasta "companies"
   ↓
4. UploadOwnershipGuard valida propriedade ← AQUI!
   ❌ companyId(1) !== entityId(2)
   → 403 Forbidden
```

### O que o Guard valida:

| UserType   | Validação                                                    |
|------------|--------------------------------------------------------------|
| COMPANY    | Só pode alterar SUA empresa e SEUS funcionários             |
| RESTAURANT | Só pode alterar SEU restaurante e SEUS pratos               |
| EMPLOYEE   | Só pode alterar SEU próprio perfil                           |

---

## 📝 Passo a Passo de Implementação

### Passo 1: Entender a Estrutura do Guard

```typescript
@Injectable()
export class UploadOwnershipGuard implements CanActivate {
  constructor(
    // 🔑 PASSO 1: Injetar os repositories necessários
    private readonly companyRepository: CompanyRepository,
    private readonly employeeRepository: EmployeeRepository,
    private readonly restaurantRepository: RestaurantRepository,
    private readonly dishRepository: DishRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 🔑 PASSO 2: Extrair dados da requisição
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Vem do JWT
    const entityId = parseInt(request.params.id); // ID da URL
    const folder = request.params.folder; // Pasta do upload
    
    // 🔑 PASSO 3: Validar baseado no userType
    switch (user.userType) {
      case 'company':
        return this.validateCompanyOwnership(entityId, user);
      case 'restaurant':
        return this.validateRestaurantOwnership(entityId, user);
      case 'employee':
        return this.validateEmployeeOwnership(entityId, user);
    }
    
    return false;
  }
}
```

### Passo 2: Registrar o Guard no Module

```typescript
// upload.module.ts
import { Module } from '@nestjs/common';
import { UploadController } from './controllers/upload.controller';
import { UploadOwnershipGuard } from '../infrastructure/guards/upload-ownership.guard';
import { CompanyRepository } from '../infrastructure/database/repositories/company.repository';
import { EmployeeRepository } from '../infrastructure/database/repositories/employee.repository';
import { RestaurantRepository } from '../infrastructure/database/repositories/restaurant.repository';
import { DishRepository } from '../infrastructure/database/repositories/dish.repository';

@Module({
  controllers: [UploadController],
  providers: [
    UploadOwnershipGuard,
    CompanyRepository,
    EmployeeRepository,
    RestaurantRepository,
    DishRepository,
  ],
})
export class UploadModule {}
```

### Passo 3: Aplicar o Guard nos Controllers

#### Opção A: Aplicar em rotas específicas

```typescript
// companies.controller.ts
import { Controller, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UploadAuthorizationGuard } from '../guards/upload-authorization.guard';
import { UploadOwnershipGuard } from '../guards/upload-ownership.guard';

@Controller('companies')
export class CompaniesController {
  
  @Patch(':id')
  @UseGuards(JwtAuthGuard, UploadAuthorizationGuard, UploadOwnershipGuard)
  //       ↑            ↑                   ↑
  //   Autentica   Valida userType    Valida propriedade
  async updateCompany(
    @Param('id') id: number,
    @Body() updateData: UpdateCompanyDto
  ) {
    // Se chegou aqui, todas as validações passaram! ✅
    return this.updateCompanyUseCase.execute(id, updateData);
  }
}
```

#### Opção B: Aplicar em todo o controller

```typescript
@Controller('companies')
@UseGuards(JwtAuthGuard, UploadAuthorizationGuard, UploadOwnershipGuard)
//        ↑ Aplica em TODAS as rotas do controller
export class CompaniesController {
  
  @Patch(':id')
  async updateCompany(...) { ... }
  
  @Delete(':id')
  async deleteCompany(...) { ... }
  
  // Ambos protegidos pelos guards!
}
```

---

## 🚀 Como Usar nos Controllers

### Exemplo 1: Controller de Companies

```typescript
// companies.controller.ts
import { Controller, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';

@Controller('companies')
export class CompaniesController {
  
  // ✅ Com guard - RECOMENDADO
  @Patch(':id')
  @UseGuards(JwtAuthGuard, UploadAuthorizationGuard, UploadOwnershipGuard)
  async updateCompany(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdateCompanyDto
  ) {
    // Validação automática feita pelo guard!
    // Se chegou aqui, o usuário TEM permissão
    return this.updateCompanyUseCase.execute(id, updateData);
  }
  
  // ❌ Sem guard - NÃO RECOMENDADO
  @Patch(':id/manual')
  @UseGuards(JwtAuthGuard)
  async updateCompanyManual(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdateCompanyDto,
    @Req() request
  ) {
    // Tem que validar manualmente 😰
    if (request.user.companyId !== id) {
      throw new ForbiddenException('Acesso negado');
    }
    
    return this.updateCompanyUseCase.execute(id, updateData);
  }
}
```

### Exemplo 2: Controller de Employees

```typescript
// employees.controller.ts
@Controller('employees')
export class EmployeesController {
  
  @Patch(':id')
  @UseGuards(JwtAuthGuard, UploadAuthorizationGuard, UploadOwnershipGuard)
  async updateEmployee(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdateEmployeeDto
  ) {
    // O guard já validou que:
    // - Se userType = 'company': employee.companyId === user.companyId
    // - Se userType = 'employee': id === user.employeeId
    
    return this.updateEmployeeUseCase.execute(id, updateData);
  }
  
  @Post(':id/photo')
  @UseGuards(JwtAuthGuard, UploadAuthorizationGuard, UploadOwnershipGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadEmployeePhoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    // Validação automática pelo guard! ✅
    
    const result = await this.s3Service.uploadFile(file, 'users');
    
    await this.employeeRepository.update(id, {
      profileImage: result.url,
      profileImageKey: result.key
    });
    
    return { success: true, data: result };
  }
}
```

### Exemplo 3: Controller de Restaurants

```typescript
// restaurants.controller.ts
@Controller('restaurants')
export class RestaurantsController {
  
  @Patch(':id')
  @UseGuards(JwtAuthGuard, UploadAuthorizationGuard, UploadOwnershipGuard)
  async updateRestaurant(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdateRestaurantDto
  ) {
    // Guard valida: user.restaurantId === id
    return this.updateRestaurantUseCase.execute(id, updateData);
  }
}
```

### Exemplo 4: Controller de Dishes

```typescript
// dishes.controller.ts
@Controller('dishes')
export class DishesController {
  
  @Patch(':id')
  @UseGuards(JwtAuthGuard, UploadAuthorizationGuard, UploadOwnershipGuard)
  async updateDish(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdateDishDto
  ) {
    // Guard busca o prato e valida: dish.restaurantId === user.restaurantId
    return this.updateDishUseCase.execute(id, updateData);
  }
  
  @Post(':id/photo')
  @UseGuards(JwtAuthGuard, UploadAuthorizationGuard, UploadOwnershipGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadDishPhoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    // Validação automática! ✅
    
    const result = await this.s3Service.uploadFile(file, 'dishes');
    
    await this.dishRepository.update(id, {
      image: result.url,
      imageKey: result.key
    });
    
    return { success: true, data: result };
  }
}
```

---

## 🧪 Testando

### Teste 1: Empresa tentando alterar outra empresa (deve falhar)

```bash
# 1. Login como Empresa A (companyId: 1)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"empresaA@example.com","password":"senha123"}'

# Resposta: { "token": "eyJhbG...", "userType": "company", "companyId": 1 }

# 2. Tentar atualizar Empresa B (ID: 2)
curl -X PATCH http://localhost:3000/companies/2 \
  -H "Authorization: Bearer <token_empresa_A>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Hackeado!"}'

# ❌ Resposta Esperada: 403 Forbidden
# {
#   "statusCode": 403,
#   "message": "Você só pode atualizar sua própria empresa",
#   "error": "Forbidden"
# }
```

### Teste 2: Empresa atualizando sua própria empresa (deve funcionar)

```bash
# Usando o mesmo token da Empresa A
curl -X PATCH http://localhost:3000/companies/1 \
  -H "Authorization: Bearer <token_empresa_A>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Empresa Atualizada"}'

# ✅ Resposta Esperada: 200 OK
# {
#   "id": 1,
#   "name": "Empresa Atualizada",
#   ...
# }
```

### Teste 3: Empresa tentando alterar funcionário de outra empresa

```bash
# Empresa A tenta atualizar funcionário da Empresa B
curl -X PATCH http://localhost:3000/employees/999 \
  -H "Authorization: Bearer <token_empresa_A>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Hackeado!"}'

# ❌ Resposta Esperada: 403 Forbidden
# {
#   "statusCode": 403,
#   "message": "Este funcionário não pertence à sua empresa",
#   "error": "Forbidden"
# }
```

### Teste 4: Funcionário tentando alterar perfil de outro funcionário

```bash
# Funcionário A (employeeId: 10) tenta alterar Funcionário B (employeeId: 20)
curl -X PATCH http://localhost:3000/employees/20 \
  -H "Authorization: Bearer <token_funcionario_A>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Hackeado!"}'

# ❌ Resposta Esperada: 403 Forbidden
# {
#   "statusCode": 403,
#   "message": "Você só pode atualizar seu próprio perfil",
#   "error": "Forbidden"
# }
```

---

## 🔍 Troubleshooting

### Problema 1: "Guard não está sendo executado"

**Sintoma:** Validação não acontece, requisições passam direto

**Solução:**
```typescript
// Verifique se o guard está registrado no module
@Module({
  providers: [UploadOwnershipGuard], // ← Certifique-se que está aqui
})

// E se está sendo usado no controller
@UseGuards(JwtAuthGuard, UploadOwnershipGuard) // ← Ordem importa!
```

### Problema 2: "Repository não injetado"

**Sintoma:** `TypeError: Cannot read property 'getById' of undefined`

**Solução:**
```typescript
// Adicione o repository no module
@Module({
  providers: [
    UploadOwnershipGuard,
    CompanyRepository, // ← Adicione todos os repositories necessários
    EmployeeRepository,
    RestaurantRepository,
    DishRepository,
  ],
})
```

### Problema 3: "request.user é undefined"

**Sintoma:** `Cannot read property 'userType' of undefined`

**Solução:**
```typescript
// Certifique-se que JwtAuthGuard vem ANTES
@UseGuards(
  JwtAuthGuard,              // ← PRIMEIRO (popula request.user)
  UploadAuthorizationGuard,  // ← SEGUNDO
  UploadOwnershipGuard       // ← TERCEIRO
)
```

### Problema 4: "TypeError: Cannot read property 'params' of undefined"

**Sintoma:** Erro ao acessar `request.params.id`

**Solução:**
```typescript
// Certifique-se que a rota tem :id
@Patch(':id') // ← Importante!
async updateCompany(@Param('id') id: number) { ... }
```

---

## 📋 Checklist de Implementação

### Antes de usar em produção:

- [ ] ✅ Guard criado (`upload-ownership.guard.ts`)
- [ ] ✅ Guard registrado nos modules necessários
- [ ] ✅ Repositories injetados no guard
- [ ] ✅ Guard aplicado em todos os endpoints de update
- [ ] ✅ Ordem dos guards correta (JWT → Authorization → Ownership)
- [ ] ✅ Testado cenários de sucesso
- [ ] ✅ Testado cenários de falha
- [ ] ✅ Logs de auditoria implementados (opcional)
- [ ] ✅ Documentação atualizada

---

## 🎯 Resumo

### O que você aprendeu:

1. ✅ **O que é** um guard de ownership
2. ✅ **Como funciona** a validação em múltiplas camadas
3. ✅ **Como implementar** passo a passo
4. ✅ **Como usar** nos controllers
5. ✅ **Como testar** a segurança

### Próximos passos:

1. Aplicar o guard nos seus controllers
2. Testar todos os cenários
3. Adicionar logs de auditoria (opcional)
4. Documentar no Swagger

---

**Dúvidas?** Releia a seção específica ou teste os exemplos! 🚀

**Criado em:** 20/10/2025  
**Autor:** Tutorial UploadOwnershipGuard - Backend iFoodClub
