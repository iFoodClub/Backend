import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token JWT para autenticação'
  })
  token: string;

  @ApiProperty({
    example: {
      id: 1,
      email: 'usuario@exemplo.com',
      userType: 'company',
      company: {
        id: 1,
        name: 'Empresa Exemplo',
        // outros detalhes da empresa
      }
    },
    description: 'Detalhes do usuário logado'
  })
  userDetails: {
    id: number;
    email: string;
    userType: string;
    [key: string]: any; // para os detalhes específicos do tipo de usuário
  };
}