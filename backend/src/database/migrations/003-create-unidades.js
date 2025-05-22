// backend/src/database/migrations/003-create-unidades.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('unidades', {
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
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      numero: {
        type: Sequelize.STRING,
        allowNull: false
      },
      bloco: {
        type: Sequelize.STRING,
        allowNull: true
      },
      andar: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      tipo: {
        type: Sequelize.ENUM('apartamento', 'casa', 'comercial', 'outro'),
        allowNull: false,
        defaultValue: 'apartamento'
      },
      area_privativa: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      fracao_ideal: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('ocupado', 'vazio', 'em_obras'),
        allowNull: false,
        defaultValue: 'vazio'
      },
      observacao: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      valor_base_condominio: {
        type: Sequelize.DECIMAL(10, 2),
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
    await queryInterface.addIndex('unidades', ['condominio_id']);
    await queryInterface.addIndex('unidades', ['usuario_id']);
    await queryInterface.addIndex('unidades', ['numero']);
    await queryInterface.addIndex('unidades', ['status']);
    
    // Índice composto para garantir unicidade de unidade por condomínio
    await queryInterface.addIndex('unidades', ['condominio_id', 'numero', 'bloco'], {
      unique: true,
      name: 'unique_unidade_condominio'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('unidades');
  }
};
