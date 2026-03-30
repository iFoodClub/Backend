'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Seeders inserem IDs explícitos em "company"; a sequência SERIAL fica atrás e o próximo DEFAULT colide com PK (23505 / company_pkey).
    await queryInterface.sequelize.query(
      `SELECT CASE
        WHEN (SELECT MAX(id) FROM company) IS NULL THEN
          setval(pg_get_serial_sequence('company', 'id'), 1, false)
        ELSE
          setval(
            pg_get_serial_sequence('company', 'id'),
            (SELECT MAX(id) FROM company),
            true
          )
      END;`,
    );
  },

  async down() {},
};
