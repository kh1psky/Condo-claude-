// backend/src/database/migrations/004-create-pagamentos.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pagamentos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      unidade_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'unidades',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      tipo: {
        type: Sequelize.ENUM('condominio', 'extra', 'multa', 'outro'),
        allowNull: false,
        defaultValue: 'condominio'
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
      comprovante_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      referencia_mes: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      referencia_ano: {
        type: Sequelize.INTEGER,
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
    await queryInterface.addIndex('pagamentos', ['unidade_id']);
    await queryInterface.addIndex('pagamentos', ['status']);
    await queryInterface.addIndex('pagamentos', ['tipo']);
    await queryInterface.addIndex('pagamentos', ['data_vencimento']);
    await queryInterface.addIndex('pagamentos', ['data_pagamento']);
    await queryInterface.addIndex('pagamentos', ['referencia_mes', 'referencia_ano']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pagamentos');
  }
};
