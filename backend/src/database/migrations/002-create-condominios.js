// backend/src/database/migrations/002-create-condominios.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('condominios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nome: {
        type: Sequelize.STRING,
        allowNull: false
      },
      endereco: {
        type: Sequelize.STRING,
        allowNull: false
      },
      cidade: {
        type: Sequelize.STRING,
        allowNull: false
      },
      estado: {
        type: Sequelize.STRING(2),
        allowNull: false
      },
      cep: {
        type: Sequelize.STRING(9),
        allowNull: false
      },
      cnpj: {
        type: Sequelize.STRING(18),
        allowNull: false,
        unique: true
      },
      email_contato: {
        type: Sequelize.STRING,
        allowNull: true
      },
      telefone_contato: {
        type: Sequelize.STRING,
        allowNull: true
      },
      data_inauguracao: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('ativo', 'inativo'),
        allowNull: false,
        defaultValue: 'ativo'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Índices
    await queryInterface.addIndex('condominios', ['cnpj']);
    await queryInterface.addIndex('condominios', ['nome']);
    await queryInterface.addIndex('condominios', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('condominios');
  }
};