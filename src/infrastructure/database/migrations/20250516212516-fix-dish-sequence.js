'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Reset the sequence to the correct value based on the highest existing ID
    // Tabela vazia: setval(..., 1, false) → próximo id = 1. Com dados: último id + 1 na próxima inserção.
    await queryInterface.sequelize.query(
      `SELECT CASE
        WHEN (SELECT MAX(id) FROM dish) IS NULL THEN
          setval(pg_get_serial_sequence('dish', 'id'), 1, false)
        ELSE
          setval(
            pg_get_serial_sequence('dish', 'id'),
            (SELECT MAX(id) FROM dish),
            true
          )
      END;`,
    );
  },

  async down(queryInterface, Sequelize) {
    // No need to revert this change
  }
};