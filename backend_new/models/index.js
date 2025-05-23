const { Sequelize } = require('sequelize');
const config = require('../config/config');

// Initialize Sequelize with connection URL
const sequelize = new Sequelize(config.database.url, {
  dialect: 'mysql',
  logging: config.database.logging,
  define: {
    timestamps: true,
    underscored: true,
  },
  dialectOptions: config.database.dialectOptions,
  pool: config.database.pool
});

// Test the database connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
}

testConnection();

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
