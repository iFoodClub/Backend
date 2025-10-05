'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('company', [
      {
        id: 1,
        userId: 7,
        restaurantId: 1,
        name: 'Food Club',
        cnpj: '12.345.678/0001-90',
        cep: '12345-678',
        number: '123',
      },
      {
        id: 2,
        userId: 8,
        restaurantId: 2,
        name: 'Food Lovers',
        cnpj: '98.765.432/0001-21',
        cep: '87654-321',
        number: '456',
      },
      {
        id: 3,
        userId: 9,
        restaurantId: 3,
        name: 'Gourmet Partners',
        cnpj: '87.654.321/0001-32',
        cep: '76543-210',
        number: '789',
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('company', null, {});
  }
};