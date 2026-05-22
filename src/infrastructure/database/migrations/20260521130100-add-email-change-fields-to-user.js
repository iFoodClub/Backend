'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn('user', 'pending_email', {
      type: DataTypes.STRING(100),
      allowNull: true,
    });
    await queryInterface.addColumn('user', 'email_change_token', {
      type: DataTypes.STRING(100),
      allowNull: true,
    });
    await queryInterface.addColumn('user', 'email_change_token_expires_at', {
      type: DataTypes.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('user', 'pending_email');
    await queryInterface.removeColumn('user', 'email_change_token');
    await queryInterface.removeColumn('user', 'email_change_token_expires_at');
  },
};
