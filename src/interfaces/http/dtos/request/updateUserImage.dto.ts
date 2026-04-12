import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserImageDto {
  @ApiProperty({
    description: 'URL da imagem de perfil do usuário',
    type: String,
    example:
      'https://bomgourmet.com/bomgourmet/restaurantes/osteria-trattoria-ristorante-diferencas-locais-tipicos-italia/',
  })
  profileImage: string;
}
