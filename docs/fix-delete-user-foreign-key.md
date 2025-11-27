# 🔧 Correção: Erro de Foreign Key ao Deletar Usuário

## 🐛 Problema Original

Ao tentar deletar usuário ID 1, ocorria erro:

```
update or delete on table "order_item" violates foreign key constraint 
"employee_weekly_orders_orderItemId_fkey" on table "employee_weekly_orders"
```

**Causa:** Violação de integridade referencial. O usuário tinha registros dependentes em várias tabelas que impediam a deleção direta.

## 🔍 Cadeia de Relacionamentos

```
User (id: 1)
  └─> Employee (userId: 1)
       ├─> EmployeeWeeklyOrders (employeeId: X)
       │    └─> OrderItem (id: Y) ← FOREIGN KEY CONSTRAINT
       └─> IndividualOrder (employeeId: X)
  
  └─> Company (userId: 1)
       └─> Employees (companyId: X)
  
  └─> Restaurant (userId: 1)
       └─> Dishes (restaurantId: X)
```

## ✅ Solução Implementada

Modificado `DeleteUserService` para deletar em **cascata** todos os registros relacionados **antes** de deletar o usuário.

### Ordem de Deleção:

1. **Employee Weekly Orders** (pedidos semanais)
2. **Individual Orders** (pedidos individuais)
3. **Employee** (funcionário)
4. **Company** (empresa)
5. **Restaurant** (restaurante)
6. **User** (usuário - por último)

### Código Implementado:

```typescript
// delete-user.use-cases.ts

async execute(id: number): Promise<void> {
    // Verificar se usuário existe
    const user = await this.userRepository.getById(id);
    if (!user) {
        throw new NotFoundException('Usuário não encontrado');
    }

    // 1. Deletar Employee e seus relacionamentos
    const employee = await this.employeeRepository.findByUserId(id);
    if (employee) {
        // 1a. Deletar pedidos semanais
        const weeklyOrders = await this.employeeWeeklyOrdersRepository
            .findByEmployeeId(employee.id);
        for (const weeklyOrder of weeklyOrders) {
            await this.employeeWeeklyOrdersRepository.delete(weeklyOrder.id);
        }

        // 1b. Deletar pedidos individuais
        const individualOrders = await this.individualOrderRepository
            .listByEmployee(employee.id);
        for (const order of individualOrders) {
            await this.individualOrderRepository.delete(order.id);
        }

        // 1c. Deletar employee
        await this.employeeRepository.delete(employee.id);
    }

    // 2. Deletar Company (se existir)
    const company = await this.companyRepository.findByUserId(id);
    if (company) {
        await this.companyRepository.delete(company.id);
    }

    // 3. Deletar Restaurant (se existir)
    const restaurant = await this.restaurantRepository.findByUserId(id);
    if (restaurant) {
        await this.restaurantRepository.delete(restaurant.id);
    }

    // 4. Finalmente, deletar o usuário
    await this.userRepository.delete(id);
}
```

### Dependências Adicionadas no UserModule:

```typescript
// user.module.ts

import { employeeProvider } from 'src/infrastructure/providers/employee.provider';
import { companyProvider } from 'src/infrastructure/providers/company.provider';
import { restaurantProvider } from 'src/infrastructure/providers/restaurant.provider';
import { employeeWeeklyOrdersProvider } from 'src/infrastructure/providers/employee-weekly-orders.provider';
import { individualOrderProvider } from 'src/infrastructure/providers/individual-order.provider';

import { EmployeeRepository } from 'src/infrastructure/database/repositories/employee.repository';
import { CompanyRepository } from 'src/infrastructure/database/repositories/company.repository';
import { RestaurantRepository } from 'src/infrastructure/database/repositories/restaurant.repository';
import { EmployeeWeeklyOrdersRepository } from 'src/infrastructure/database/repositories/employee-weekly-orders.repository';
import { IndividualOrderRepository } from 'src/infrastructure/database/repositories/individual-order.repository';

providers: [
  ...userProvider,
  ...employeeProvider,
  ...companyProvider,
  ...restaurantProvider,
  ...employeeWeeklyOrdersProvider,
  ...individualOrderProvider,
  UserRepository,
  EmployeeRepository,
  CompanyRepository,
  RestaurantRepository,
  EmployeeWeeklyOrdersRepository,
  IndividualOrderRepository,
  // ... demais services
],
```

## 🧪 Como Testar

```bash
# Login como usuário a ser deletado
POST /user/login
{ "email": "user@test.com", "password": "senha123" }

# Deletar próprio perfil
DELETE /user/1
Authorization: Bearer <seu_token>

# ✅ Resposta esperada (200 OK):
# Usuário e todos os seus dados relacionados foram deletados em cascata
```

## ⚠️ Considerações Importantes

### 1. **Transaction** (Futuro)
Idealmente, toda essa operação deveria estar dentro de uma **transaction** para garantir atomicidade:

```typescript
// Exemplo (não implementado ainda)
await sequelize.transaction(async (t) => {
  // Todas as deleções aqui
  await employeeWeeklyOrdersRepository.delete(id, { transaction: t });
  await employeeRepository.delete(id, { transaction: t });
  await userRepository.delete(id, { transaction: t });
});
```

Se alguma deleção falhar, todas seriam revertidas automaticamente.

### 2. **Soft Delete** (Recomendado para Produção)
Em vez de deletar permanentemente, considere implementar **soft delete** (deleção lógica):

```typescript
// Adicionar coluna `deletedAt` nas tabelas
@Column({
  type: DataType.DATE,
  allowNull: true,
})
deletedAt: Date;

// No repository:
async softDelete(id: number): Promise<void> {
  const user = await this.userEntity.findByPk(id);
  await user.update({ deletedAt: new Date() });
}

// Nas queries, filtrar automaticamente:
async findAll(): Promise<UserEntityInterface[]> {
  return await this.userEntity.findAll({
    where: { deletedAt: null }  // Só retorna não-deletados
  });
}
```

**Vantagens:**
- Dados não são perdidos permanentemente
- Possibilidade de "restaurar" usuários
- Histórico completo mantido
- Compliance com LGPD/GDPR (mantém registros de auditoria)

### 3. **Cascade Delete no Banco de Dados**
Você pode configurar `CASCADE` diretamente nas foreign keys do PostgreSQL:

```sql
-- Na migration:
ALTER TABLE employee_weekly_orders
DROP CONSTRAINT employee_weekly_orders_orderItemId_fkey;

ALTER TABLE employee_weekly_orders
ADD CONSTRAINT employee_weekly_orders_orderItemId_fkey
FOREIGN KEY (orderItemId)
REFERENCES order_item(id)
ON DELETE CASCADE;  -- ← Adicionar CASCADE
```

**Vantagens:**
- Banco de dados garante integridade
- Mais performático (uma única query)
- Não precisa de lógica no código

**Desvantagens:**
- Menos controle no código
- Dificulta auditing/logging
- Pode deletar dados não intencionalmente

### 4. **Avisos ao Usuário**
Considere adicionar confirmação antes de deletar:

```typescript
// No controller
@Delete(':id')
async delete(
  @Param('id') id: number,
  @Query('confirm') confirm?: string,
  @Res() res: Response
) {
  if (confirm !== 'true') {
    return res.status(400).json({
      success: false,
      message: 'Atenção: Esta ação deletará permanentemente o usuário e TODOS os seus dados relacionados (pedidos, avaliações, etc). Para confirmar, adicione ?confirm=true na URL',
    });
  }

  await this.deleteUserService.execute(id);
  res.status(200).json({ success: true, message: 'Usuário deletado' });
}
```

### 5. **Logs de Auditoria**
Registre quem deletou o quê:

```typescript
// Antes de deletar
await this.auditLogService.create({
  eventType: 'USER_DELETED',
  entityType: 'User',
  entityId: id,
  userId: currentUser.id,  // Quem executou a ação
  metadata: {
    deletedUser: {
      email: user.email,
      userType: user.userType,
    },
    relatedData: {
      employeeId: employee?.id,
      companyId: company?.id,
      restaurantId: restaurant?.id,
    }
  }
});
```

## 📊 Arquivos Modificados

1. ✅ `src/application/use-cases/delete-user.use-cases.ts` (MODIFICADO)
2. ✅ `src/interfaces/http/user.module.ts` (MODIFICADO)

## 🚀 Status

✅ **Problema Resolvido** - Agora é possível deletar usuários sem erro de foreign key.

⚠️ **Recomendação:** Implementar soft delete + transactions para ambiente de produção.

---

**Correção implementada em:** 27/11/2025
