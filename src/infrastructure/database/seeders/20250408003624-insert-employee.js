'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('employee', [
      {
        id: 1,
        userId: 10,
        companyId: 1,
        name: 'João da Silva',
        cpf: '123.456.789-00',
        birthDate: '1990-01-01',
        vacation: false,
      },
      {
        id: 2,
        userId: 11,
        companyId: 1,
        name: 'Maria Oliveira',
        cpf: '234.567.890-11',
        birthDate: '1992-05-15',
        vacation: true,
      },
      {
        id: 3,
        userId: 12,
        companyId: 2,
        name: 'Carlos Souza',
        cpf: '345.678.901-22',
        birthDate: '1988-11-20',
        vacation: false,
      },
      {
        id: 4,
        userId: 13,
        companyId: 2,
        name: 'Ana Costa',
        cpf: '456.789.012-33',
        birthDate: '1995-03-10',
        vacation: false,
      },
      {
        id: 5,
        userId: 14,
        companyId: 3,
        name: 'Pedro Santos',
        cpf: '567.890.123-44',
        birthDate: '1991-07-25',
        vacation: true,
      },
      {
        id: 6,
        userId: 15,
        companyId: 3,
        name: 'Lucia Ferreira',
        cpf: '678.901.234-55',
        birthDate: '1993-09-30',
        vacation: false,
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('employee', null, {});
  }
};