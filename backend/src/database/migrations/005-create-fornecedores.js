// backend/src/database/migrations/005-create-fornecedores.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('fornecedores', {
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
      tipo_servico: {
        type: Sequelize.STRING,
        allowNull: false
      },
      cnpj_cpf: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      tipo_pessoa: {
        type: Sequelize.ENUM('fisica', 'juridica'),
        allowNull: false,
        defaultValue: 'juridica'
      },
      endereco: {
        type: Sequelize.STRING,
        allowNull: true
      },
      cidade: {
        type: Sequelize.STRING,
        allowNull: true
      },
      estado: {
        type: Sequelize.STRING(2),
        allowNull: true
      },
      cep: {
        type: Sequelize.STRING(9),
        allowNull: true
      },
      telefone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      website: {
        type: Sequelize.STRING,
        allowNull: true
      },
      contato_nome: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('ativo', 'inativo'),
        allowNull: false,
        defaultValue: 'ativo'
      },
      observacoes: {
        type: Sequelize.TEXT,
        allowNull: true
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
    await queryInterface.addIndex('fornecedores', ['cnpj_cpf']);
    await queryInterface.addIndex('fornecedores', ['nome']);
    await queryInterface.addIndex('fornecedores', ['tipo_servico']);
    await queryInterface.addIndex('fornecedores', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('fornecedores');
  }
};