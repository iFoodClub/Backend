require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false, // opcional: remove logs SQL do console
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Necessário para o Render
      }
    }
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false, // opcional: remove logs SQL do console
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Necessário para o Render
      }
    }
  }
}