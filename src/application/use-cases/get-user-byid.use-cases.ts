import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UserRepository } from '../../infrastructure/database/repositories/user.repository';
import { UserLoginEntityInterface } from "src/domain/repositories/user-login.repository.interface";

@Injectable()
export class GetUserByIdService {
    constructor(
        @Inject('USER_REPOSITORY')
        private readonly userRepository: UserRepository
    ) {}

    async execute(id: number): Promise<UserLoginEntityInterface> {
        const user = await this.userRepository.getById(id);
        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }
        return {
            id: user.id,
            email: user.email,
            userType: user.userType,
            profileImage: user.profileImage,
        };
    }
}