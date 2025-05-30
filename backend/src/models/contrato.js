// backend/src/models/contrato.js
module.exports = (sequelize, DataTypes) => {
    const Contrato = sequelize.define('Contrato', {
      numero: {
        type: DataTypes.STRING,
        allowNull: false
      },
      objeto: {
        type: DataTypes.STRING,
        allowNull: false
      },
      descricao: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      data_inicio: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      data_fim: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      valor: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      periodicidade_pagamento: {
        type: DataTypes.ENUM('unico', 'mensal', 'bimestral', 'trimestral', 'semestral', 'anual'),
        allowNull: false,
        defaultValue: 'mensal'
      },
      renovacao_automatica: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      status: {
        type: DataTypes.ENUM('vigente', 'encerrado', 'cancelado', 'em_analise'),
        allowNull: false,
        defaultValue: 'vigente'
      },
      arquivo_url: {
        type: DataTypes.STRING,
        allowNull: true
      },
      observacoes: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, {
      tableName: 'contratos'
    });
  
    // Associações
    Contrato.associate = function(models) {
      Contrato.belongsTo(models.Condominio, {
        foreignKey: 'condominio_id',
        as: 'condominio'
      });
      
      Contrato.belongsTo(models.Fornecedor, {
        foreignKey: 'fornecedor_id',
        as: 'fornecedor'
      });
    };
  
    return Contrato;
  };