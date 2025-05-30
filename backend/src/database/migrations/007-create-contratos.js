// backend/src/database/migrations/007-create-contratos.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contratos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      condominio_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'condominios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      fornecedor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'fornecedores',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      numero: {
        type: Sequelize.STRING,
        allowNull: false
      },
      objeto: {
        type: Sequelize.STRING,
        allowNull: false
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      data_inicio: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      data_fim: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      valor: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      periodicidade_pagamento: {
        type: Sequelize.ENUM('unico', 'mensal', 'bimestral', 'trimestral', 'semestral', 'anual'),
        allowNull: false,
        defaultValue: 'mensal'
      },
      renovacao_automatica: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      status: {
        type: Sequelize.ENUM('vigente', 'encerrado', 'cancelado', 'em_analise'),
        allowNull: false,
        defaultValue: 'vigente'
      },
      arquivo_url: {
        type: Sequelize.STRING,
        allowNull: true
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
    await queryInterface.addIndex('contratos', ['condominio_id']);
    await queryInterface.addIndex('contratos', ['fornecedor_id']);
    await queryInterface.addIndex('contratos', ['numero']);
    await queryInterface.addIndex('contratos', ['status']);
    await queryInterface.addIndex('contratos', ['data_inicio']);
    await queryInterface.addIndex('contratos', ['data_fim']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('contratos');
  }
};