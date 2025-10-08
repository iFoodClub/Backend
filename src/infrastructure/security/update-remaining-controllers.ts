/**
 * Script para aplicar proteções de segurança nos controllers restantes
 */

// CONTROLLERS RESTANTES:
const remainingControllers = [
  'src/interfaces/http/controllers/restaurant.controller.ts',
  'src/interfaces/http/controllers/dish.controller.ts', 
  'src/interfaces/http/controllers/dish-rating.controller.ts',
  'src/interfaces/http/controllers/restaurant-rating.controller.ts',
  'src/interfaces/http/controllers/employee-weekly-orders.controller.ts',
  'src/interfaces/http/controllers/health-check.controller.ts'
];

// ALTERAÇÕES NECESSÁRIAS em cada controller:

// 1. ADICIONAR aos imports do @nestjs/common:
// UseGuards, UsePipes

// 2. ADICIONAR imports de segurança:
/*
import { SqlInjectionGuard } from '../../../infrastructure/security/sql-injection.guard';
import { InputValidationPipe } from '../../../infrastructure/security/input-validation.pipe';
import { ValidateId, SanitizeInput } from '../../../infrastructure/security/validation.decorators';
*/

// 3. ADICIONAR decorators na classe:
/*
@UseGuards(SqlInjectionGuard)
@UsePipes(InputValidationPipe)
export class [NomeDoController] {
*/

export { remainingControllers };
