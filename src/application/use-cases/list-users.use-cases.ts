import { Inject, Injectable } from "@nestjs/common";
import { UserLoginEntityInterface } from "../../domain/repositories/user-login.repository.interface";
import { UserRepository } from '../../infrastructure/database/repositories/user.repository';

@Injectable()
export class ListUsersService {
    constructor(
        @Inject('USER_REPOSITORY')
        private readonly userRepository: UserRepository
    ) {}

    async execute(): Promise<UserLoginEntityInterface[]> {
        const users = await this.userRepository.list();
        return users.map(user => ({
            id: user.id,
            email: user.email,
            userType: user.userType,
            profileImage: user.profileImage,
        }));
    }
}