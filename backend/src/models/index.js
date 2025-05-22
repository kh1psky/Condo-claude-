// backend/src/models/index.js
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const dbConfig = require('../config/database');
const logger = require('../config/logger');

const db = {};
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig
);

// Carrega todos os modelos automaticamente
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== path.basename(__filename) &&
      file.slice(-3) === '.js'
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

// Executa os métodos associate se existirem
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Sincronização do banco apenas em desenvolvimento
if (process.env.NODE_ENV === 'development' && process.env.SYNC_DB === 'true') {
  db.sequelize
    .sync({ force: true })
    .then(() => {
      logger.info('Banco de dados sincronizado com sucesso.');
    })
    .catch(err => {
      logger.error('Erro ao sincronizar banco de dados:', err);
    });
}

module.exports = db;