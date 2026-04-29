'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('restaurant', 'openingTime', {
      type: Sequelize.STRING(10),
      allowNull: true,
    });
    await queryInterface.addColumn('restaurant', 'closingTime', {
      type: Sequelize.STRING(10),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('restaurant', 'openingTime');
    await queryInterface.removeColumn('restaurant', 'closingTime');
  }
};
