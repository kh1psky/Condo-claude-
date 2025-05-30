// backend/src/models/financeiro_avancado.js
module.exports = (sequelize, DataTypes) => {
    const FinanceiroAvancado = sequelize.define('FinanceiroAvancado', {
      tipo: {
        type: DataTypes.ENUM('receita', 'despesa'),
        allowNull: false
      },
      categoria: {
        type: DataTypes.STRING,
        allowNull: false
      },
      descricao: {
        type: DataTypes.STRING,
        allowNull: false
      },
      valor: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      data_vencimento: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      data_pagamento: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('pendente', 'pago', 'atrasado', 'cancelado'),
        allowNull: false,
        defaultValue: 'pendente'
      },
      recorrente: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      periodicidade: {
        type: DataTypes.ENUM('mensal', 'bimestral', 'trimestral', 'semestral', 'anual'),
        allowNull: true
      },
      comprovante_url: {
        type: DataTypes.STRING,
        allowNull: true
      },
      observacoes: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, {
      tableName: 'financeiro_avancado'
    });
  
    // Associações
    FinanceiroAvancado.associate = function(models) {
      FinanceiroAvancado.belongsTo(models.Condominio, {
        foreignKey: 'condominio_id',
        as: 'condominio'
      });
      
      FinanceiroAvancado.belongsTo(models.Fornecedor, {
        foreignKey: 'fornecedor_id',
        as: 'fornecedor'
      });
    };
  
    return FinanceiroAvancado;
  };