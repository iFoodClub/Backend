'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('favorite_restaurant', [
      {
        userId: 10, // João da Silva (Employee of Food Club)
        restaurantId: 1, // Sabores do Chef
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: 10,
        restaurantId: 2, // Trattoria Italiana
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: 10,
        restaurantId: 4, // Sushi Palace
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: 11, // Maria Oliveira (Also Food Club)
        restaurantId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('favorite_restaurant', null, {});
  }
};
