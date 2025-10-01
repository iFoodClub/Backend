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

## Support

## Stay in touch

## License
