'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('restaurant', 'openingTime', {
      type: Sequelize.STRING(5), // Formato HH:mm
      allowNull: true,
    });
    await queryInterface.addColumn('restaurant', 'closingTime', {
      type: Sequelize.STRING(5), // Formato HH:mm
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('restaurant', 'openingTime');
    await queryInterface.removeColumn('restaurant', 'closingTime');
  }
};
