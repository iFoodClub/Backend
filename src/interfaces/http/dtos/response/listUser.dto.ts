import { ApiProperty } from "@nestjs/swagger";

export class ListUserDtoResponse {
    @ApiProperty({
        type: 'number',
        description: 'ID do usuário',
        example: 2,
    })
  id: number;

    @ApiProperty({
        type: 'string',
        description: 'Tipo de usuário',
        example: 'restaurant',
    })
  userType: string;

    @ApiProperty({
        type: 'string',
        description: 'Email do usuário',
        example: 'italian@restaurant.com',
    })
  email: string;

    @ApiProperty({
        type: 'string',
        description: 'URL da imagem de perfil do usuário',
        example: 'https://bomgourmet.com/bomgourmet/restaurantes/osteria-trattoria-ristorante-diferencas-locais-tipicos-italia/',
    })
  profileImage: string;
}

// funcionario
// {
//   "name": "João da Silva",
//   "email": "joao.silva@email.com",
//   "password": "senha123",
//   "userType": "employee",
//   "cpf": "12345678901",
//   "employee": {
//     "name": "João da Silva",
//     "birthDate": "1990-05-10"
//   },
//   "company": {
//     "id": 1
//   }
// }

// restaurante
// {
//   "name": "Restaurante Saboroso",
//   "email": "restaurante@email.com",
//   "password": "senha123",
//   "userType": "restaurant",
//   "cnpj": "98765432000188",
//   "restaurant": {
//     "name": "Restaurante Saboroso",
//     "cep": "87654321",
//     "number": "200"
//   }
// }

// empresa
// {
//   "name": "Restaurante Saboroso",
//   "email": "restaurante@email.com",
//   "password": "senha123",
//   "userType": "restaurant",
//   "cnpj": "98765432000188",
//   "restaurant": {
//     "name": "Restaurante Saboroso",
//     "cep": "87654321",
//     "number": "200"
//   }
// }