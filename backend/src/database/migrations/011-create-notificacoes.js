// backend/src/database/migrations/011-create-notificacoes.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notificacoes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      unidade_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'unidades',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      titulo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      mensagem: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      tipo: {
        type: Sequelize.ENUM('info', 'aviso', 'urgente', 'sistema'),
        allowNull: false,
        defaultValue: 'info'
      },
      data_leitura: {
        type: Sequelize.DATE,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('enviada', 'lida'),
        allowNull: false,
        defaultValue: 'enviada'
      },
      link: {
        type: Sequelize.STRING,
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
    await queryInterface.addIndex('notificacoes', ['usuario_id']);
    await queryInterface.addIndex('notificacoes', ['unidade_id']);
    await queryInterface.addIndex('notificacoes', ['tipo']);
    await queryInterface.addIndex('notificacoes', ['status']);
    await queryInterface.addIndex('notificacoes', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('notificacoes');
  }
};