const { sequelize, testConnection } = require('../config/db');
const { Sequelize } = require('sequelize');

// Test the database connection
testConnection().catch(console.error);

// Import models
const db = {
  sequelize,
  Sequelize,
  User: require('./user')(sequelize, Sequelize)
};

// Define associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
