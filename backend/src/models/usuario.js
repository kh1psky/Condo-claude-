// backend/src/models/usuario.js
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('Usuario', {
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    senha: {
      type: DataTypes.STRING,
      allowNull: false
    },
    telefone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    cpf: {
      type: DataTypes.STRING(14),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    tipo: {
      type: DataTypes.ENUM('admin', 'sindico', 'morador'),
      allowNull: false,
      defaultValue: 'morador'
    },
    status: {
      type: DataTypes.ENUM('ativo', 'inativo'),
      allowNull: false,
      defaultValue: 'ativo'
    },
    ultimo_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    token_reset_senha: {
      type: DataTypes.STRING,
      allowNull: true
    },
    expiracao_token_reset: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'usuarios',
    hooks: {
      // Hash da senha antes de salvar
      beforeSave: async (usuario) => {
        if (usuario.changed('senha')) {
          usuario.senha = await bcrypt.hash(usuario.senha, 10);
        }
      }
    }
  });

  // Método para verificar senha
  Usuario.prototype.checkSenha = function(senha) {
    return bcrypt.compare(senha, this.senha);
  };

  // Associações
  Usuario.associate = function(models) {
    Usuario.hasMany(models.Unidade, {
      foreignKey: 'usuario_id',
      as: 'unidades'
    });
    
    Usuario.hasMany(models.Notificacao, {
      foreignKey: 'usuario_id',
      as: 'notificacoes'
    });
    
    Usuario.hasMany(models.Manutencao, {
      foreignKey: 'usuario_solicitante_id',
      as: 'manutencoes_solicitadas'
    });
  };

  return Usuario;
};