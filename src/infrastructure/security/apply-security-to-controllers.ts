/**
 * Script para aplicar proteções de segurança em todos os controllers
 * Este arquivo serve como referência para as alterações necessárias
 */

// IMPORTS NECESSÁRIOS para cada controller:
/*
import { UseGuards, UsePipes } from '@nestjs/common';
import { SqlInjectionGuard } from '../../../infrastructure/security/sql-injection.guard';
import { InputValidationPipe } from '../../../infrastructure/security/input-validation.pipe';
import { ValidateId, SanitizeInput } from '../../../infrastructure/security/validation.decorators';
*/

// DECORATORS NECESSÁRIOS para cada controller:
/*
@UseGuards(SqlInjectionGuard)
@UsePipes(InputValidationPipe)
export class [NomeDoController] {
*/

// CONTROLLERS QUE PRECISAM SER ATUALIZADOS:
const controllers = [
  'src/interfaces/http/controllers/user.controller.ts',           // ✅ JÁ ATUALIZADO
  'src/interfaces/http/controllers/company.controller.ts',        // ✅ JÁ ATUALIZADO
  'src/interfaces/http/controllers/employee.controller.ts',       // ⏳ PENDENTE
  'src/interfaces/http/controllers/restaurant.controller.ts',     // ⏳ PENDENTE
  'src/interfaces/http/controllers/dish.controller.ts',           // ⏳ PENDENTE
  'src/interfaces/http/controllers/dish-rating.controller.ts',     // ⏳ PENDENTE
  'src/interfaces/http/controllers/restaurant-rating.controller.ts', // ⏳ PENDENTE
  'src/interfaces/http/controllers/employee-weekly-orders.controller.ts', // ⏳ PENDENTE
  'src/interfaces/http/controllers/health-check.controller.ts',    // ⏳ PENDENTE
];

// ALTERAÇÕES NECESSÁRIAS em cada controller:

// 1. ADICIONAR imports:
// - Adicionar UseGuards, UsePipes aos imports do @nestjs/common
// - Adicionar imports das classes de segurança

// 2. ADICIONAR decorators na classe:
// - @UseGuards(SqlInjectionGuard)
// - @UsePipes(InputValidationPipe)

// 3. OPCIONAL - Usar decorators específicos nos métodos:
// - @ValidateId('id') para parâmetros de ID
// - @SanitizeInput('param') para strings de entrada

export { controllers };
