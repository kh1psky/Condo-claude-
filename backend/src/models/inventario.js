// backend/src/models/inventario.js
module.exports = (sequelize, DataTypes) => {
    const Inventario = sequelize.define('Inventario', {
      nome: {
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
      quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      unidade_medida: {
        type: DataTypes.STRING,
        allowNull: true
      },
      local_armazenamento: {
        type: DataTypes.STRING,
        allowNull: true
      },
      data_aquisicao: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      valor_unitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('disponivel', 'em_uso', 'em_manutencao', 'baixado'),
        allowNull: false,
        defaultValue: 'disponivel'
      },
      estoque_minimo: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      codigo: {
        type: DataTypes.STRING,
        allowNull: true
      },
      foto_url: {
        type: DataTypes.STRING,
        allowNull: true
      },
      observacoes: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, {
      tableName: 'inventario'
    });
  
    // Associações
    Inventario.associate = function(models) {
      Inventario.belongsTo(models.Condominio, {
        foreignKey: 'condominio_id',
        as: 'condominio'
      });
      
      Inventario.hasMany(models.ManutencaoInventario, {
        foreignKey: 'inventario_id',
        as: 'usos_em_manutencoes'
      });
    };
  
    return Inventario;
  };