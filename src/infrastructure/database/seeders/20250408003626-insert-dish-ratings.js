'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('dish_rating', [
      {
        id: 1,
        dishId: 1,
        userId: 10,
        rating: 5,
        description: 'Prato muito bom',
      },
      {
        id: 2,
        dishId: 1,
        userId: 11,
        rating: 3,
        description: 'Prato bom, mas poderia ser melhor',
      },
      {
        id: 3,
        dishId: 4,
        userId: 12,
        rating: 4,
        description: 'Sabor incrível',
      },
      {
        id: 4,
        dishId: 6,
        userId: 13,
        rating: 5,
        description: 'Melhores tacos que já comi',
      },
      {
        id: 5,
        dishId: 8,
        userId: 14,
        rating: 4,
        description: 'Sushi muito fresco',
      },
      {
        id: 6,
        dishId: 10,
        userId: 15,
        rating: 3,
        description: 'Bom para uma opção vegana',
      },
      {
        id: 7,
        dishId: 12,
        userId: 10,
        rating: 5,
        description: 'Costelas perfeitas',
      },
      {
        id: 8,
        dishId: 2,
        userId: 11,
        rating: 4,
        description: 'Pizza autêntica',
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('dish_rating', null, {});
  }
};