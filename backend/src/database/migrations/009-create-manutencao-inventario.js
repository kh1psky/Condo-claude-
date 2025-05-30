// backend/src/database/migrations/009-create-manutencao-inventario.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('manutencao_inventario', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      manutencao_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'manutencoes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      inventario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'inventario',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      quantidade_utilizada: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      observacao: {
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
      }
    });

    // Índices
    await queryInterface.addIndex('manutencao_inventario', ['manutencao_id']);
    await queryInterface.addIndex('manutencao_inventario', ['inventario_id']);
    
    // Índice composto para evitar duplicatas
    await queryInterface.addIndex('manutencao_inventario', ['manutencao_id', 'inventario_id'], {
      unique: true,
      name: 'unique_manutencao_inventario'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('manutencao_inventario');
  }
};
