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

# production with migrations before boot
$ npm run start:prod:migrate
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

O backend serve imagens via Azure Blob Storage usando `DefaultAzureCredential` por padrão. Se você quiser evitar erro de autorização no ambiente local, também pode definir `AZURE_STORAGE_ACCOUNT_KEY` e o serviço vai usar a chave da Storage como fallback.

Em produção na Azure, a forma mais comum continua sendo rodar a aplicação com Managed Identity e dar permissão `Storage Blob Data Contributor` na storage account.

Variáveis principais para configurar no ambiente da Azure:

```bash
AZURE_STORAGE_ACCOUNT_NAME=<nome-da-storage-account>
AZURE_STORAGE_ACCOUNT_KEY=<account-key-da-storage-account>
# Opcional; pode ser omitida se o nome da storage account estiver definido.
AZURE_STORAGE_ACCOUNT_URL=https://<account>.blob.core.windows.net
AZURE_STORAGE_CONTAINER_NAME=app-uploads
# Opcional; use apenas se estiver com User Assigned Managed Identity.
AZURE_CLIENT_ID=<client-id-da-managed-identity>
API_PUBLIC_BASE_URL=https://<url-publica-da-aplicacao>
```

Se você preencher `AZURE_STORAGE_ACCOUNT_KEY`, ela terá prioridade para upload/download. Se a identidade for `System Assigned`, deixe `AZURE_CLIENT_ID` vazio. Se for `User Assigned`, associe a identidade ao App Service ou Container App e mantenha o `AZURE_CLIENT_ID` preenchido com o client id dela.

O upload continua em `POST /upload/image/:folder`, e a imagem pode ser lida em `GET /upload/image?key=...`.

## Support

## Stay in touch

## License
