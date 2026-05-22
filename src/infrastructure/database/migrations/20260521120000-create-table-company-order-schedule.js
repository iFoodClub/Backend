'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('company_order_schedule', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'company',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      dayOfWeek: {
        type: DataTypes.ENUM(
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ),
        allowNull: false,
      },
      triggerTime: {
        type: DataTypes.STRING(5), // Formato HH:mm
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.addConstraint('company_order_schedule', {
      fields: ['companyId', 'dayOfWeek'],
      type: 'unique',
      name: 'company_order_schedule_company_day_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint(
      'company_order_schedule',
      'company_order_schedule_company_day_unique',
    );
    await queryInterface.dropTable('company_order_schedule');
  },
};
