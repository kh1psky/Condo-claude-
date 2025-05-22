// backend/src/models/unidade.js
module.exports = (sequelize, DataTypes) => {
    const Unidade = sequelize.define('Unidade', {
      numero: {
        type: DataTypes.STRING,
        allowNull: false
      },
      bloco: {
        type: DataTypes.STRING,
        allowNull: true
      },
      andar: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      tipo: {
        type: DataTypes.ENUM('apartamento', 'casa', 'comercial', 'outro'),
        allowNull: false,
        defaultValue: 'apartamento'
      },
      area_privativa: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      fracao_ideal: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('ocupado', 'vazio', 'em_obras'),
        allowNull: false,
        defaultValue: 'vazio'
      },
      observacao: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      valor_base_condominio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      }
    }, {
      tableName: 'unidades'
    });
  
    // Associações
    Unidade.associate = function(models) {
      Unidade.belongsTo(models.Condominio, {
        foreignKey: 'condominio_id',
        as: 'condominio'
      });
      
      Unidade.belongsTo(models.Usuario, {
        foreignKey: 'usuario_id',
        as: 'proprietario'
      });
      
      Unidade.hasMany(models.Pagamento, {
        foreignKey: 'unidade_id',
        as: 'pagamentos'
      });
      
      Unidade.hasMany(models.Notificacao, {
        foreignKey: 'unidade_id',
        as: 'notificacoes'
      });
    };
  
    return Unidade;
  };
  