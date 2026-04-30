'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Seeders inserem IDs explícitos em "user"; a sequência SERIAL fica atrás e o próximo DEFAULT colide com PK.
    await queryInterface.sequelize.query(
      `SELECT CASE
        WHEN (SELECT MAX(id) FROM "user") IS NULL THEN
          setval(pg_get_serial_sequence('"user"', 'id'), 1, false)
        ELSE
          setval(
            pg_get_serial_sequence('"user"', 'id'),
            (SELECT MAX(id) FROM "user"),
            true
          )
      END;`,
    );
  },

  async down() {
    // Sem reversão necessária
  },
};
