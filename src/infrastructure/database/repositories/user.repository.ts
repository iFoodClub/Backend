import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { UserEntityInterface } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class UserRepository {
  constructor(
    @Inject('USER_ENTITY')
    private readonly userEntity: typeof UserEntity,
  ) {}

  async list(): Promise<UserEntityInterface[]> {
    return await this.userEntity.findAll();
  }

  async create(user: Omit<UserEntityInterface, 'id'>): Promise<UserEntityInterface> {
    return await this.userEntity.create(user);
  }

  async findByEmail(email: string): Promise<UserEntityInterface | null> {
    return await this.userEntity.findOne({ where: { email } });
  }

  async updateImage(
    id: number,
    userData: Partial<Omit<UserEntityInterface, 'id'>>,
  ): Promise<UserEntityInterface> {
    const user = await this.userEntity.findByPk(id);
    return await user.update(userData);
  }

  async getById(id: number): Promise<UserEntityInterface | null> {
    return await this.userEntity.findByPk(id);
  }

  async delete(id: number): Promise<void> {
    const user = await this.userEntity.findByPk(id);
    await user.destroy();
  }
}