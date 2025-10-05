const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
     await queryInterface.createTable('order_item', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      dishId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'dish',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('order_item');
  },
};