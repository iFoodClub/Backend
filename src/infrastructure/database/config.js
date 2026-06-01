const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '../../../.env'),
});

function dialectOptions() {
  if (process.env.DB_SSL === 'false') {
    return {};
  }
  return {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  };
}

function connectionConfig() {
  if (process.env.DATABASE_URL) {
    return {
      use_env_variable: 'DATABASE_URL',
    };
  }

  return {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
  };
}

function baseConfig() {
  return {
    dialect: 'postgres',
    logging: false,
    dialectOptions: dialectOptions(),
    ...connectionConfig(),
  };
}

module.exports = {
  development: baseConfig(),
  production: baseConfig(),
};
