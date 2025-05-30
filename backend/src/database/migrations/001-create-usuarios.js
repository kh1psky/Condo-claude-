module.exports = {
    async up(queryInterface, Sequelize) {
      await queryInterface.createTable('usuarios', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        nome: {
          type: Sequelize.STRING,
          allowNull: false
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        senha: {
          type: Sequelize.STRING,
          allowNull: false
        },
        telefone: {
          type: Sequelize.STRING,
          allowNull: true
        },
        cpf: {
          type: Sequelize.STRING(14),
          allowNull: false,
          unique: true
        },
        tipo: {
          type: Sequelize.ENUM('admin', 'sindico', 'morador'),
          allowNull: false,
          defaultValue: 'morador'
        },
        status: {
          type: Sequelize.ENUM('ativo', 'inativo'),
          allowNull: false,
          defaultValue: 'ativo'
        },
        ultimo_login: {
          type: Sequelize.DATE,
          allowNull: true
        },
        token_reset_senha: {
          type: Sequelize.STRING,
          allowNull: true
        },
        expiracao_token_reset: {
          type: Sequelize.DATE,
          allowNull: true
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true
        }
      });
  
      // Índices
      await queryInterface.addIndex('usuarios', ['email']);
      await queryInterface.addIndex('usuarios', ['cpf']);
      await queryInterface.addIndex('usuarios', ['tipo']);
      await queryInterface.addIndex('usuarios', ['status']);
    },
  
    async down(queryInterface, Sequelize) {
      await queryInterface.dropTable('usuarios');
    }
  };