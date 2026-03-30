'use strict';

/**
 * Um pedido de empresa (company_order) para o restaurante 1 e empresa 1,
 * permitindo GET /Restaurant/1/orders retornar 200 em testes manuais (ex.: CT-24).
 */
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [rows] = await queryInterface.sequelize.query(
      `SELECT id FROM company_order WHERE id = 1 LIMIT 1`,
    );

    if (!rows || rows.length === 0) {
      await queryInterface.bulkInsert('company_order', [
        {
          id: 1,
          companyId: 1,
          restaurantId: 1,
          status: 'pending',
        },
      ]);
    }

    await queryInterface.sequelize.query(
      `SELECT setval(
        pg_get_serial_sequence('company_order', 'id'),
        (SELECT MAX(id) FROM company_order),
        true
      );`,
    );
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete('company_order', null, {});
  },
};
