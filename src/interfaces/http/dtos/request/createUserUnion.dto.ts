import { ApiProperty } from "@nestjs/swagger";
import { CreateEmployeeUserDto } from "./createEmployeeUser.dto";
import { CreateRestaurantUserDto } from "./createRestaurantUser.dto";
import { CreateCompanyUserDto } from "./createCompanyUser.dto";

export class CreateUserUnionDto {
    @ApiProperty({
        description: 'Dados para criação de usuário. Escolha um dos 3 tipos abaixo:',
        oneOf: [
            {
                $ref: '#/components/schemas/CreateEmployeeUserDto',
                description: 'Para criar um funcionário'
            },
            {
                $ref: '#/components/schemas/CreateRestaurantUserDto', 
                description: 'Para criar um restaurante'
            },
            {
                $ref: '#/components/schemas/CreateCompanyUserDto',
                description: 'Para criar uma empresa'
            }
        ],
        examples: {
            employee: {
                summary: 'Exemplo de criação de funcionário',
                description: 'Cria um funcionário associado a uma empresa',
                value: {
                    name: "João da Silva",
                    email: "joao.silva@email.com",
                    password: "senha123",
                    userType: "employee",
                    cpf: "12345678901",
                    employee: {
                        name: "João da Silva",
                        birthDate: "1990-05-10"
                    },
                    company: {
                        id: 1
                    }
                }
            },
            restaurant: {
                summary: 'Exemplo de criação de restaurante',
                description: 'Cria um restaurante',
                value: {
                    name: "Restaurante Saboroso",
                    email: "restaurante@email.com",
                    password: "senha123",
                    userType: "restaurant",
                    cnpj: "98765432000188",
                    restaurant: {
                        name: "Restaurante Saboroso",
                        cep: "87654321",
                        number: "200"
                    }
                }
            },
            company: {
                summary: 'Exemplo de criação de empresa',
                description: 'Cria uma empresa',
                value: {
                    name: "Empresa ABC Ltda",
                    email: "empresa@email.com",
                    password: "senha123",
                    userType: "company",
                    cnpj: "12345678000199",
                    company: {
                        name: "Empresa ABC Ltda",
                        cep: "12345678",
                        number: "100"
                    }
                }
            }
        }
    })
    userData: CreateEmployeeUserDto | CreateRestaurantUserDto | CreateCompanyUserDto;
} 