'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('company', 'orderCutoffTime', {
      type: Sequelize.STRING(5), // Formato HH:mm (ex: "11:30")
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('company', 'orderCutoffTime');
  }
};
