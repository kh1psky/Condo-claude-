// backend/src/models/notificacao.js
module.exports = (sequelize, DataTypes) => {
    const Notificacao = sequelize.define('Notificacao', {
      titulo: {
        type: DataTypes.STRING,
        allowNull: false
      },
      mensagem: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      tipo: {
        type: DataTypes.ENUM('info', 'aviso', 'urgente', 'sistema'),
        allowNull: false,
        defaultValue: 'info'
      },
      data_leitura: {
        type: DataTypes.DATE,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('enviada', 'lida'),
        allowNull: false,
        defaultValue: 'enviada'
      },
      link: {
        type: DataTypes.STRING,
        allowNull: true
      }
    }, {
      tableName: 'notificacoes'
    });
  
    // Associações
    Notificacao.associate = function(models) {
      Notificacao.belongsTo(models.Usuario, {
        foreignKey: 'usuario_id',
        as: 'usuario'
      });
      
      Notificacao.belongsTo(models.Unidade, {
        foreignKey: 'unidade_id',
        as: 'unidade'
      });
    };
  
    return Notificacao;
  };