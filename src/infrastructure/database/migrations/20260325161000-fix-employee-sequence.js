'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      `SELECT CASE
        WHEN (SELECT MAX(id) FROM employee) IS NULL THEN
          setval(pg_get_serial_sequence('employee', 'id'), 1, false)
        ELSE
          setval(
            pg_get_serial_sequence('employee', 'id'),
            (SELECT MAX(id) FROM employee),
            true
          )
      END;`,
    );
  },

  async down() {},
};
