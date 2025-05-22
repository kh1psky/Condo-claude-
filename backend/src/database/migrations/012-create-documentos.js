// backend/src/database/migrations/012-create-documentos.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('documentos', {
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
      manutencao_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'manutencoes',
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
        allowNull: true
      },
      categoria: {
        type: Sequelize.STRING,
        allowNull: false
      },
      arquivo_url: {
        type: Sequelize.STRING,
        allowNull: false
      },
      arquivo_nome: {
        type: Sequelize.STRING,
        allowNull: false
      },
      tipo_arquivo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      tamanho_arquivo: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      publico: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      data_referencia: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      tags: {
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
    await queryInterface.addIndex('documentos', ['condominio_id']);
    await queryInterface.addIndex('documentos', ['manutencao_id']);
    await queryInterface.addIndex('documentos', ['categoria']);
    await queryInterface.addIndex('documentos', ['publico']);
    await queryInterface.addIndex('documentos', ['data_referencia']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('documentos');
  }
};