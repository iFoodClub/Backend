const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('restaurant', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'user',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      cnpj: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      cep: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      rua: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      cidade: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      estado: {
        type: DataTypes.STRING(2),
        allowNull: false,
      },
      number: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      complemento: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('restaurant');
  },
};