// backend/src/models/pagamento.js
module.exports = (sequelize, DataTypes) => {
    const Pagamento = sequelize.define('Pagamento', {
      tipo: {
        type: DataTypes.ENUM('condominio', 'extra', 'multa', 'outro'),
        allowNull: false,
        defaultValue: 'condominio'
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
      comprovante_url: {
        type: DataTypes.STRING,
        allowNull: true
      },
      referencia_mes: {
        type: DataTypes.INTEGER, // 1-12 para mês
        allowNull: true
      },
      referencia_ano: {
        type: DataTypes.INTEGER, // ex: 2023
        allowNull: true
      }
    }, {
      tableName: 'pagamentos'
    });
  
    // Associações
    Pagamento.associate = function(models) {
      Pagamento.belongsTo(models.Unidade, {
        foreignKey: 'unidade_id',
        as: 'unidade'
      });
    };
  
    return Pagamento;
  };
  