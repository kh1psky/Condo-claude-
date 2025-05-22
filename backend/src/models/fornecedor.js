// backend/src/models/fornecedor.js
module.exports = (sequelize, DataTypes) => {
    const Fornecedor = sequelize.define('Fornecedor', {
      nome: {
        type: DataTypes.STRING,
        allowNull: false
      },
      tipo_servico: {
        type: DataTypes.STRING,
        allowNull: false
      },
      cnpj_cpf: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      tipo_pessoa: {
        type: DataTypes.ENUM('fisica', 'juridica'),
        allowNull: false,
        defaultValue: 'juridica'
      },
      endereco: {
        type: DataTypes.STRING,
        allowNull: true
      },
      cidade: {
        type: DataTypes.STRING,
        allowNull: true
      },
      estado: {
        type: DataTypes.STRING(2),
        allowNull: true
      },
      cep: {
        type: DataTypes.STRING(9),
        allowNull: true
      },
      telefone: {
        type: DataTypes.STRING,
        allowNull: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isEmail: true
        }
      },
      website: {
        type: DataTypes.STRING,
        allowNull: true
      },
      contato_nome: {
        type: DataTypes.STRING,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('ativo', 'inativo'),
        allowNull: false,
        defaultValue: 'ativo'
      },
      observacoes: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, {
      tableName: 'fornecedores'
    });
  
    // Associações
    Fornecedor.associate = function(models) {
      Fornecedor.hasMany(models.Contrato, {
        foreignKey: 'fornecedor_id',
        as: 'contratos'
      });
      
      Fornecedor.hasMany(models.Manutencao, {
        foreignKey: 'fornecedor_id',
        as: 'manutencoes'
      });
      
      Fornecedor.hasMany(models.FinanceiroAvancado, {
        foreignKey: 'fornecedor_id',
        as: 'financeiro'
      });
    };
  
    return Fornecedor;
  };
  