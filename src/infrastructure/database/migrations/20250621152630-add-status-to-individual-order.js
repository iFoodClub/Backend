'use strict';
const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('individual_order', 'status', {
      type: DataTypes.ENUM('preparing', 'completed'),
      allowNull: false,
      defaultValue: 'preparing',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('individual_order', 'status');
  }
}; 