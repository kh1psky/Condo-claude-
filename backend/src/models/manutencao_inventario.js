// backend/src/models/manutencao_inventario.js
module.exports = (sequelize, DataTypes) => {
    const ManutencaoInventario = sequelize.define('ManutencaoInventario', {
      quantidade_utilizada: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      observacao: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, {
      tableName: 'manutencao_inventario'
    });
  
    // Associações
    ManutencaoInventario.associate = function(models) {
      ManutencaoInventario.belongsTo(models.Manutencao, {
        foreignKey: 'manutencao_id',
        as: 'manutencao'
      });
      
      ManutencaoInventario.belongsTo(models.Inventario, {
        foreignKey: 'inventario_id',
        as: 'item'
      });
    };
  
    return ManutencaoInventario;
  };