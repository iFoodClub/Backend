import { UserEntity } from '../database/entities/user.entity';
import { UserRepository } from '../database/repositories/user.repository';

export const userProvider = [
  {
    provide: 'USER_ENTITY',
    useValue: UserEntity,
  },
  {
    provide: 'USER_REPOSITORY',
    useClass: UserRepository,
  },
];