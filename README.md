## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Database
```bash
# create migration
$ npx sequelize-cli migration:generate --name [migration name]

# run all migrations
$ npx sequelize-cli db:migrate

# undo last migration
$ npx sequelize-cli db:migrate:undo

# undo all migrations
$ npx sequelize-cli db:migrate:undo:all

# create seeders
$ npx sequelize-cli seed:generate --name [seeder name]

# run all seeders
$ npx sequelize-cli db:seed:all

# undo all seeders
$ npx sequelize-cli db:seed:undo
```

## Resources

## Upload de Imagens

O backend serve imagens via Azure Blob Storage usando Managed Identity. O upload continua em `POST /upload/image/:folder`, e o arquivo pode ser acessado por uma URL estável do próprio backend em `GET /upload/image?key=...`.

Variáveis principais:

```bash
AZURE_STORAGE_ACCOUNT_NAME=...
AZURE_STORAGE_ACCOUNT_URL=https://<account>.blob.core.windows.net
AZURE_STORAGE_CONTAINER_NAME=app-uploads
AZURE_CLIENT_ID=<client-id-da-user-assigned-managed-identity>
API_PUBLIC_BASE_URL=http://localhost:3000
```

Em produção, associe a User Assigned Managed Identity ao Container App e conceda `Storage Blob Data Contributor` na storage account.

## Support

## Stay in touch

## License
