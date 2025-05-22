import { Sequelize } from 'sequelize';
import config from './config.js';

// Create Sequelize instance for MySQL
const sequelize = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: 'mysql',
    logging: config.db.logging,
    dialectOptions: {
      ssl: config.db.ssl ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  }
);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connection established successfully.');
    console.log(`Environment: ${config.server.env}`);
    console.log(`Database: ${config.db.database}@${config.db.host}:${config.db.port}`);
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to MySQL:', error.message);
    console.error(`Environment: ${config.server.env}`);
    console.error(`Attempted to connect to: ${config.db.database}@${config.db.host}:${config.db.port}`);
    throw error;
  }
};

// Sync database models
const syncDatabase = async () => {
  try {
    if (config.isDevelopment) {
      await sequelize.sync({ alter: true });
      console.log('✅ Database synchronized successfully.');
    }
  } catch (error) {
    console.error('❌ Unable to sync database:', error.message);
    throw error;
  }
};

export { sequelize, testConnection, syncDatabase };
