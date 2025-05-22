// backend/src/models/documento.js
module.exports = (sequelize, DataTypes) => {
    const Documento = sequelize.define('Documento', {
      titulo: {
        type: DataTypes.STRING,
        allowNull: false
      },
      descricao: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      categoria: {
        type: DataTypes.STRING,
        allowNull: false
      },
      arquivo_url: {
        type: DataTypes.STRING,
        allowNull: false
      },
      arquivo_nome: {
        type: DataTypes.STRING,
        allowNull: false
      },
      tipo_arquivo: {
        type: DataTypes.STRING,
        allowNull: false
      },
      tamanho_arquivo: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      publico: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      data_referencia: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      tags: {
        type: DataTypes.STRING,
        allowNull: true
      }
    }, {
      tableName: 'documentos'
    });
  
    // Associações
    Documento.associate = function(models) {
      Documento.belongsTo(models.Condominio, {
        foreignKey: 'condominio_id',
        as: 'condominio'
      });
      
      Documento.belongsTo(models.Manutencao, {
        foreignKey: 'manutencao_id',
        as: 'manutencao'
      });
    };
  
    return Documento;
  };