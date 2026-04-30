'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      `SELECT CASE
        WHEN (SELECT MAX(id) FROM restaurant_rating) IS NULL THEN
          setval(pg_get_serial_sequence('restaurant_rating', 'id'), 1, false)
        ELSE
          setval(
            pg_get_serial_sequence('restaurant_rating', 'id'),
            (SELECT MAX(id) FROM restaurant_rating),
            true
          )
      END;`,
    );
  },

  async down() {},
};
