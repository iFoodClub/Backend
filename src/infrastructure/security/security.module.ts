import { Module, Global } from '@nestjs/common';
import { SqlInjectionGuard } from './sql-injection.guard';
import { InputValidationPipe } from './input-validation.pipe';

@Global()
@Module({
  providers: [
    SqlInjectionGuard,
    InputValidationPipe,
  ],
  exports: [
    SqlInjectionGuard,
    InputValidationPipe,
  ],
})
export class SecurityModule {}

