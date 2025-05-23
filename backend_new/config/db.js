const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'railway',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'turntable.proxy.rlwy.net',
  port: process.env.DB_PORT || 11148,
  dialect: 'mysql',
  logging: console.log, // Enable logging for debugging
  define: {
    timestamps: true,
    underscored: true,
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test the database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    return false;
  }
};

// Sync database models
const syncDatabase = async (force = false) => {
  try {
    // Drop all tables if force is true
    if (force) {
      console.log('Dropping all tables...');
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      await sequelize.sync({ force: true });
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    } else {
      await sequelize.sync();
    }
    console.log(`✅ Database synced${force ? ' (force)' : ''}`);
    return true;
  } catch (error) {
    console.error('❌ Error syncing database:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase
};