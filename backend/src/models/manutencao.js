// backend/src/models/manutencao.js
module.exports = (sequelize, DataTypes) => {
    const Manutencao = sequelize.define('Manutencao', {
      titulo: {
        type: DataTypes.STRING,
        allowNull: false
      },
      descricao: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      local: {
        type: DataTypes.STRING,
        allowNull: false
      },
      tipo: {
        type: DataTypes.ENUM('preventiva', 'corretiva', 'emergencial'),
        allowNull: false,
        defaultValue: 'corretiva'
      },
      prioridade: {
        type: DataTypes.ENUM('baixa', 'media', 'alta', 'critica'),
        allowNull: false,
        defaultValue: 'media'
      },
      status: {
        type: DataTypes.ENUM('solicitada', 'aprovada', 'em_andamento', 'concluida', 'cancelada'),
        allowNull: false,
        defaultValue: 'solicitada'
      },
      data_solicitacao: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      data_aprovacao: {
        type: DataTypes.DATE,
        allowNull: true
      },
      data_inicio: {
        type: DataTypes.DATE,
        allowNull: true
      },
      data_conclusao: {
        type: DataTypes.DATE,
        allowNull: true
      },
      custo_estimado: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      custo_real: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      observacoes: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, {
      tableName: 'manutencoes'
    });
  
    // Associações
    Manutencao.associate = function(models) {
      Manutencao.belongsTo(models.Condominio, {
        foreignKey: 'condominio_id',
        as: 'condominio'
      });
      
      Manutencao.belongsTo(models.Usuario, {
        foreignKey: 'usuario_solicitante_id',
        as: 'solicitante'
      });
      
      Manutencao.belongsTo(models.Fornecedor, {
        foreignKey: 'fornecedor_id',
        as: 'fornecedor'
      });
      
      Manutencao.hasMany(models.ManutencaoInventario, {
        foreignKey: 'manutencao_id',
        as: 'itens_utilizados'
      });
      
      Manutencao.hasMany(models.Documento, {
        foreignKey: 'manutencao_id',
        as: 'documentos'
      });
    };
  
    return Manutencao;
  };
  