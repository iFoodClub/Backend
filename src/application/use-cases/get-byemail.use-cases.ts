import { Inject, Injectable } from "@nestjs/common";
import { UserRepository } from "src/infrastructure/database/repositories/user.repository";
import { UserInterface } from '../../domain/models/user.model';

@Injectable()
export class GetUserByEmailService {
    constructor(
        @Inject('USER_REPOSITORY')
        private readonly userRepository: UserRepository
    ) {}

    async execute(email: string): Promise<UserInterface> {
        return this.userRepository.findByEmail(email);
    }
}