// backend/src/database/migrations/006-create-manutencoes.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('manutencoes', {
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
      usuario_solicitante_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
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
      titulo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      local: {
        type: Sequelize.STRING,
        allowNull: false
      },
      tipo: {
        type: Sequelize.ENUM('preventiva', 'corretiva', 'emergencial'),
        allowNull: false,
        defaultValue: 'corretiva'
      },
      prioridade: {
        type: Sequelize.ENUM('baixa', 'media', 'alta', 'critica'),
        allowNull: false,
        defaultValue: 'media'
      },
      status: {
        type: Sequelize.ENUM('solicitada', 'aprovada', 'em_andamento', 'concluida', 'cancelada'),
        allowNull: false,
        defaultValue: 'solicitada'
      },
      data_solicitacao: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      data_aprovacao: {
        type: Sequelize.DATE,
        allowNull: true
      },
      data_inicio: {
        type: Sequelize.DATE,
        allowNull: true
      },
      data_conclusao: {
        type: Sequelize.DATE,
        allowNull: true
      },
      custo_estimado: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      custo_real: {
        type: Sequelize.DECIMAL(10, 2),
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
    await queryInterface.addIndex('manutencoes', ['condominio_id']);
    await queryInterface.addIndex('manutencoes', ['usuario_solicitante_id']);
    await queryInterface.addIndex('manutencoes', ['fornecedor_id']);
    await queryInterface.addIndex('manutencoes', ['status']);
    await queryInterface.addIndex('manutencoes', ['prioridade']);
    await queryInterface.addIndex('manutencoes', ['tipo']);
    await queryInterface.addIndex('manutencoes', ['data_solicitacao']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('manutencoes');
  }
};