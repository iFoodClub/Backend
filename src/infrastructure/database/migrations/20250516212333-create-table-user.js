const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('user', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      email: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      userType: {
        type: DataTypes.ENUM('company', 'employee', 'restaurant'),
        allowNull: false,
        field: 'user_type',
      },
      profileImage: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'profile_image',
        comment: 'Caminho ou URL da imagem de perfil do usuário',
      },
      verificationToken: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'verification_token',
      },
      verificationTokenExpireAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'verification_token_expire_at',
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user');
  },
};