'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Reset the sequence to the correct value based on the highest existing ID
    await queryInterface.sequelize.query(
      `SELECT setval(pg_get_serial_sequence('dish', 'id'), (SELECT COALESCE(MAX(id), 1) FROM dish));`
    );
  },

  async down(queryInterface, Sequelize) {
    // No need to revert this change
  }
};