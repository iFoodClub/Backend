import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { CreateEmployeeUserDto } from './interfaces/http/dtos/request/createEmployeeUser.dto';
import { CreateRestaurantUserDto } from './interfaces/http/dtos/request/createRestaurantUser.dto';
import { CreateCompanyUserDto } from './interfaces/http/dtos/request/createCompanyUser.dto';

async function bootstrap() {
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  const app = await NestFactory.create(AppModule);

  // Habilitando CORS
  app.enableCors();

  // Configurando validação global
  app.useGlobalPipes(new ValidationPipe());

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('Food Club API')
    .setDescription('API do sistema Food Club - Gerenciamento de restaurantes e pedidos')
    .setVersion('1.0')
    .addTag('auth', 'Endpoints de autenticação')
    .addTag('users', 'Gerenciamento de usuários')
    .addTag('restaurants', 'Gerenciamento de restaurantes')
    .addTag('dishes', 'Gerenciamento de pratos')
    .addTag('employees', 'Gerenciamento de funcionários')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [CreateEmployeeUserDto, CreateRestaurantUserDto, CreateCompanyUserDto]
  });
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(port);
  console.log(`Aplicação rodando na porta ${port}`);
  console.log(`Documentação Swagger disponível em: http://localhost:${port}/api`);
}

bootstrap();
