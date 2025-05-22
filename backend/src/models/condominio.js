// backend/src/models/condominio.js
module.exports = (sequelize, DataTypes) => {
    const Condominio = sequelize.define('Condominio', {
      nome: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      endereco: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      cidade: {
        type: DataTypes.STRING,
        allowNull: false
      },
      estado: {
        type: DataTypes.STRING(2),
        allowNull: false
      },
      cep: {
        type: DataTypes.STRING(9),
        allowNull: false
      },
      cnpj: {
        type: DataTypes.STRING(18),
        allowNull: false,
        unique: true
      },
      email_contato: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isEmail: true
        }
      },
      telefone_contato: {
        type: DataTypes.STRING,
        allowNull: true
      },
      data_inauguracao: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('ativo', 'inativo'),
        allowNull: false,
        defaultValue: 'ativo'
      }
    }, {
      tableName: 'condominios'
    });
  
    // Associações
    Condominio.associate = function(models) {
      Condominio.hasMany(models.Unidade, {
        foreignKey: 'condominio_id',
        as: 'unidades'
      });
      
      Condominio.hasMany(models.Contrato, {
        foreignKey: 'condominio_id',
        as: 'contratos'
      });
      
      Condominio.hasMany(models.Documento, {
        foreignKey: 'condominio_id',
        as: 'documentos'
      });
      
      Condominio.hasMany(models.Inventario, {
        foreignKey: 'condominio_id',
        as: 'inventario'
      });
      
      Condominio.hasMany(models.Manutencao, {
        foreignKey: 'condominio_id',
        as: 'manutencoes'
      });
      
      Condominio.hasMany(models.FinanceiroAvancado, {
        foreignKey: 'condominio_id',
        as: 'financeiro'
      });
    };
  
    return Condominio;
  };