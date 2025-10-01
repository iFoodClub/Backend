import { Inject, Injectable } from "@nestjs/common";
import { UserEntityInterface } from "../../domain/repositories/user.repository.interface";
import { UserRepository } from '../../infrastructure/database/repositories/user.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UpdateUserService {
    constructor(
        @Inject('USER_REPOSITORY')
        private readonly userRepository: UserRepository
    ) {}

    async execute(
        id: number,
        userData: Partial<Omit<UserEntityInterface, 'id'>>
    ): Promise<UserEntityInterface> {
        if (userData.password) {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            userData.password = hashedPassword;
        }
        return await this.userRepository.updateImage(id, userData);
    }
}