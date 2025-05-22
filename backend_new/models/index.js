const { Sequelize } = require('sequelize');
const config = require('../config/config');
const path = require('path');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',  // Force SQLite
  storage: path.resolve(process.cwd(), config.database.storage), // Use absolute path
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
  }
});

// Import models
const db = {
  sequelize,
  Sequelize,
  User: require('./user')(sequelize, Sequelize),
  Expense: require('./expense')(sequelize, Sequelize),
  Budget: require('./budget')(sequelize, Sequelize)
};

// Define associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
