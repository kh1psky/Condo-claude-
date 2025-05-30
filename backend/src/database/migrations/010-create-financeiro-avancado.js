// backend/src/database/migrations/010-create-financeiro-avancado.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('financeiro_avancado', {
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
        allowNull: true,
        references: {
          model: 'fornecedores',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      tipo: {
        type: Sequelize.ENUM('receita', 'despesa'),
        allowNull: false
      },
      categoria: {
        type: Sequelize.STRING,
        allowNull: false
      },
      descricao: {
        type: Sequelize.STRING,
        allowNull: false
      },
      valor: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      data_vencimento: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      data_pagamento: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pendente', 'pago', 'atrasado', 'cancelado'),
        allowNull: false,
        defaultValue: 'pendente'
      },
      recorrente: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      periodicidade: {
        type: Sequelize.ENUM('mensal', 'bimestral', 'trimestral', 'semestral', 'anual'),
        allowNull: true
      },
      comprovante_url: {
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
    await queryInterface.addIndex('financeiro_avancado', ['condominio_id']);
    await queryInterface.addIndex('financeiro_avancado', ['fornecedor_id']);
    await queryInterface.addIndex('financeiro_avancado', ['tipo']);
    await queryInterface.addIndex('financeiro_avancado', ['categoria']);
    await queryInterface.addIndex('financeiro_avancado', ['status']);
    await queryInterface.addIndex('financeiro_avancado', ['data_vencimento']);
    await queryInterface.addIndex('financeiro_avancado', ['data_pagamento']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('financeiro_avancado');
  }
};