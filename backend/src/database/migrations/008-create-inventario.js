// backend/src/database/migrations/008-create-inventario.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inventario', {
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
      nome: {
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
      quantidade: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      unidade_medida: {
        type: Sequelize.STRING,
        allowNull: true
      },
      local_armazenamento: {
        type: Sequelize.STRING,
        allowNull: true
      },
      data_aquisicao: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      valor_unitario: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('disponivel', 'em_uso', 'em_manutencao', 'baixado'),
        allowNull: false,
        defaultValue: 'disponivel'
      },
      estoque_minimo: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      codigo: {
        type: Sequelize.STRING,
        allowNull: true
      },
      foto_url: {
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
    await queryInterface.addIndex('inventario', ['condominio_id']);
    await queryInterface.addIndex('inventario', ['nome']);
    await queryInterface.addIndex('inventario', ['categoria']);
    await queryInterface.addIndex('inventario', ['status']);
    await queryInterface.addIndex('inventario', ['codigo']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('inventario');
  }
};
