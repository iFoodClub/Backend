import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Res, UseGuards } from "@nestjs/common";
import { CreateUserService } from "../../../application/use-cases/create-user.use-cases";
import { DeleteUserService } from "../../../application/use-cases/delete-user.use-cases";
import { GetUserByIdService } from "../../../application/use-cases/get-user-byid.use-cases";
import { ListUsersService } from "../../../application/use-cases/list-users.use-cases";
import { UpdateUserService } from "../../../application/use-cases/update-user.use-cases";
import { Response } from "express";
import { ApiBody, ApiParam, ApiResponse, ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { ListUserDtoResponse } from "src/interfaces/http/dtos/response/listUser.dto";
import { CreateUserDto } from "src/interfaces/http/dtos/request/createUser.dto";
import { CreateEmployeeUserDto } from "src/interfaces/http/dtos/request/createEmployeeUser.dto";
import { CreateRestaurantUserDto } from "src/interfaces/http/dtos/request/createRestaurantUser.dto";
import { CreateCompanyUserDto } from "src/interfaces/http/dtos/request/createCompanyUser.dto";
import { Http400 } from "src/interfaces/http/dtos/response/http400";
import { Http404 } from "src/interfaces/http/dtos/response/http404";
import { UserInterface } from "src/domain/models/user.model";
import { LoginDto } from "src/interfaces/http/dtos/request/login.dto";
import { LoginResponseDto } from "src/interfaces/http/dtos/response/login.dto";
import { AuthService } from "../../../application/use-cases/login.use-cases";
import { JwtAuthGuard } from "../../../infrastructure/guards/jwt-auth.guard";
import { GetUserByEmailService } from "../../../application/use-cases/get-byemail.use-cases";
import { UserLoginEntityInterface } from "src/domain/repositories/user-login.repository.interface";
import { UpdateUserImageDto } from "../dtos/request/updateUserImage.dto";
import { UpdateUserPasswordDto } from "../dtos/request/updateUserPassword.dto";

@ApiTags('User API')
@Controller('user')
export class UserController {
    constructor(
        private readonly createUserService: CreateUserService,
        private readonly getUserByIdService: GetUserByIdService,
        private readonly listUsersService: ListUsersService,
        private readonly updateUserService: UpdateUserService,
        private readonly deleteUserService: DeleteUserService,
        private readonly authService: AuthService,
        private readonly getUserByEmailService: GetUserByEmailService,
    ) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiResponse({
        status: 200,
        description: 'Lista de usuários retornada com sucesso',
        type: [ListUserDtoResponse],
    })
    @ApiResponse({
        status: 401,
        description: 'Não autorizado',
    })
    async list(): Promise<UserLoginEntityInterface[]> {
        return await this.listUsersService.execute();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiParam({
        name: 'id',
        required: true,
        description: 'ID do usuário',
        schema: { type: 'number' },
    })
    @ApiResponse({
        status: 200,
        description: 'Usuário encontrado com sucesso',
        type: ListUserDtoResponse,
    })
    @ApiResponse({
        status: 404,
        description: 'Usuário não encontrado',
        type: Http404,
    })
    @ApiResponse({
        status: 401,
        description: 'Não autorizado',
    })
    async getById(@Param('id') id: number): Promise<UserLoginEntityInterface> {
        return await this.getUserByIdService.execute(id);
    }

    @Post()
    @HttpCode(201)
    @ApiOperation({ 
        summary: 'Criar usuário', 
        description: `Cria um novo usuário no sistema. Existem 3 tipos de usuários:

---

### 1. Funcionário (employee)
- **Campos obrigatórios:** \`name\`, \`email\`, \`password\`, \`cpf\`, \`employee\`, \`company\`
- O campo \`employee\` deve conter: \`name\`, \`birthDate\`
- O campo \`company\` deve co, \`profileImage\`nter: \`id\` (ID da empresa)

**Exemplo:**
\`\`\`json
{
  "email": "joao.silva@email.com",
  "password": "senha123",
  "userType": "employee",
  "profileImage": "https://exemplo.com/joao.jpg",
  "cpf": "12345678901",
  "employee": {
    "name": "João da Silva",
    "birthDate": "1990-05-10"
  },
  "company": {
    "id": 1
  }
}
\`\`\`

---

### 2. Restaurante (restaurant)
- **Campos obrigatórios:** \`name\`, \`email\`, \`password\`, \`profileImage\`, \`cnpj\`, \`restaurant\`
- O campo \`restaurant\` deve conter: \`name\`, \`cep\`, \`rua\`, \`cidade\`, \`estado\`, \`number\`, \`complemento\` (opcional)

**Exemplo:**
\`\`\`json
{
  "email": "restaurante@email.com",
  "password": "senha123",
  "userType": "restaurant",
  "profileImage": "https://exemplo.com/restaurante.jpg",
  "cnpj": "98765432000188",
  "restaurant": {
    "name": "Restaurante Saboroso",
    "cep": "87654321",
    "rua": "Rua das Flores",
    "cidade": "São Paulo",
    "estado": "SP",
    "number": "200",
    "complemento": "Sala 101"
  }
}
\`\`\`

---

### 3. Empresa (company)
- **Campos obrigatórios:** \`name\`, \`email\`, \`password\`, \`profileImage\`, \`cnpj\`, \`company\`
- O campo \`company\` deve conter: \`name\`, \`cep\`, \`number\` e opcionalmente \`restaurantId\` (pode ser \`null\`)

**Exemplo:**
\`\`\`json
{
  "email": "empresa@email.com",
  "password": "senha123",
  "userType": "company",
  "profileImage": "https://exemplo.com/empresa.jpg",
  "cnpj": "12345678000199",
  "company": {
    "name": "Empresa ABC Ltda",
    "cep": "12345678",
    "number": "100",
    "restaurantId": null
  }
}
\`\`\`
`
    })
    @ApiBody({
        description: 'Dados do usuário - Escolha um dos 3 tipos disponíveis',
        schema: {
            oneOf: [
                { $ref: '#/components/schemas/CreateRestaurantUserDto' },
                { $ref: '#/components/schemas/CreateEmployeeUserDto' },
                { $ref: '#/components/schemas/CreateCompanyUserDto' }
            ],
            examples: {
                employee: {
                    summary: 'Criar funcionário',
                    description: 'Exemplo para criar um funcionário',
                    value: {
                        email: "joao.silva@email.com",
                        password: "senha123",
                        userType: "employee",
                        profileImage: "https://exemplo.com/joao.jpg",
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
                    summary: 'Criar restaurante',
                    description: 'Exemplo para criar um restaurante',
                    value: {
                        email: "restaurante@email.com",
                        password: "senha123",
                        userType: "restaurant",
                        profileImage: "https://exemplo.com/restaurante.jpg",
                        cnpj: "98765432000188",
                        restaurant: {
                            name: "Restaurante Saboroso",
                            cep: "87654321",
                            rua: "Rua das Flores",
                            cidade: "São Paulo",
                            estado: "SP",
                            number: "200",
                            complemento: "Sala 101"
                        }
                    }
                },
                company: {
                    summary: 'Criar empresa',
                    description: 'Exemplo para criar uma empresa',
                    value: {
                        email: "empresa@email.com",
                        password: "senha123",
                        userType: "company",
                        profileImage: "https://exemplo.com/empresa.jpg",
                        cnpj: "12345678000199",
                        company: {
                            name: "Empresa ABC Ltda",
                            cep: "12345678",
                            number: "100"
                        }
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Usuário criado com sucesso',
    })
    @ApiResponse({
        status: 400,
        description: 'Erro ao criar usuário - Verifique se todos os campos obrigatórios foram preenchidos corretamente',
        type: Http400,
    })
    async create(@Body() user: UserInterface,@Res() res: Response): Promise<void> {
        const { email, password, userType} = user;
        if (!(email && password && userType)) {
            throw new Error('Todos os campos são obrigatórios');
        }
        await this.createUserService.execute(user);
        res.send();
    }

    @Put('image/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiParam({
        name: 'id',
        required: true,
        description: 'ID do usuário',
        schema: { type: 'number' },
    })
    @ApiBody({
        description: 'Dados do usuário',
        type: UpdateUserImageDto,
    })
    @ApiResponse({
        status: 200,
        description: 'Usuário atualizado com sucesso',
    })
    @ApiResponse({
        status: 404,
        description: 'Usuário não encontrado',
        type: Http404,
    })
    @ApiResponse({
        status: 401,
        description: 'Não autorizado',
    })
    async updateImage(@Param('id') id: number, @Body() user: UserInterface, @Res() res: Response): Promise<void> {
        const expectedFields = ['profileImage'];
        const receivedFields = Object.keys(user);
        const invalidFields = receivedFields.filter(field => !expectedFields.includes(field));
        const userUpdated = await this.updateUserService.execute(Number(id), user);
        if (!userUpdated) {
            res.status(404).json({
                success: false,
                message: 'Usuário não encontrado',
            });
            return;
        }
        if (invalidFields.length > 0) {
            res.status(400).json({
                success: false,
                message: `Os seguintes campos são inválidos: ${invalidFields.join(', ')}`,
            });
            return;
        }
        res.status(200).json(userUpdated);
    }

    @Put('password/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiParam({
        name: 'id',
        required: true,
        description: 'ID do usuário',
        schema: { type: 'number' },
    })
    @ApiBody({
        description: 'Dados do usuário',
        type: UpdateUserPasswordDto,
    })
    @ApiResponse({
        status: 200,
        description: 'Senha atualizada com sucesso',
    })
    @ApiResponse({
        status: 404,
        description: 'Usuário não encontrado',
        type: Http404,
    })
    @ApiResponse({
        status: 400,
        description: 'Erro ao atualizar senha',
        type: Http400,
    })
    @ApiResponse({
        status: 401,
        description: 'Não autorizado',
    })
    async updatePassword(@Param('id') id: number, @Body() user: UserInterface, @Res() res: Response): Promise<void> {
        const expectedFields = ['password'];
        const receivedFields = Object.keys(user);
        const invalidFields = receivedFields.filter(field => !expectedFields.includes(field));
        if (invalidFields.length > 0) {
            res.status(400).json({
                success: false,
                message: `Os seguintes campos são inválidos: ${invalidFields.join(', ')}`,
            });
            return;
        }
        const userData = await this.getUserByIdService.execute(Number(id));
        if (!userData) {
            res.status(404).json({
                success: false,
                message: 'Usuário não encontrado',
            });
            return;
        }
        const userUpdated = await this.updateUserService.execute(Number(id), { password: user.password });
        res.status(200).json(userUpdated);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiParam({
        name: 'id',
        required: true,
        description: 'ID do usuário',
        schema: { type: 'number' },
    })
    @ApiResponse({
        status: 200,
        description: 'Usuário deletado com sucesso',
    })
    @ApiResponse({
        status: 404,
        description: 'Usuário não encontrado',
        type: Http404,
    })
    @ApiResponse({
        status: 401,
        description: 'Não autorizado',
    })
    async delete(@Param('id') id: number): Promise<void> {
        await this.deleteUserService.execute(id);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Realizar login', description: 'Autentica um usuário e retorna um token JWT' })
    @ApiResponse({ 
        status: 200, 
        description: 'Login realizado com sucesso',
        type: LoginResponseDto 
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Credenciais inválidas' 
    })
    async login(@Body() body: LoginDto) {
        const { token, userDetails } = await this.authService.login(body.email, body.password);
        return { token, userDetails };
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Realizar logout', description: 'Invalida o token JWT atual' })
    @ApiResponse({ 
        status: 200, 
        description: 'Logout realizado com sucesso' 
    })
    @ApiResponse({
        status: 401,
        description: 'Não autorizado',
    })
    async logout(@Body() body: { token: string }) {
        this.authService.logout(body.token);
        return { message: 'Logout realizado com sucesso' };
    }

    @Get('check-email/:email')
    @ApiOperation({ summary: 'Verificar se o email já existe', description: 'Verifica se o email já está cadastrado no sistema.' })
    @ApiParam({
        name: 'email',
        required: true,
        description: 'Email a ser verificado',
        schema: { type: 'string', example: 'teste@email.com' },
    })
    @ApiResponse({
        status: 200,
        description: 'Retorna se o email já está cadastrado',
        schema: {
            example: { exists: true }
        }
    })
    async checkEmail(@Param('email') email: string) {
        const user = await this.getUserByEmailService.execute(email);
        return { exists: !!user };
    }
}