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
  // Don't use transactions for DDL operations in MySQL
  try {
    if (force) {
      console.log('Dropping all tables...');
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      
      // Get all table names
      const [tables] = await sequelize.query(
        "SHOW TABLES"
      );
      
      // Drop each table
      for (const table of tables) {
        const tableName = Object.values(table)[0];
        console.log(`Dropping table: ${tableName}`);
        await sequelize.query(`DROP TABLE IF EXISTS \`${tableName}\``);
      }
      
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    }
    
    // Sync all models without force to prevent data loss
    console.log('Syncing models...');
    await sequelize.sync({ alter: true });
    
    console.log(`✅ Database synced${force ? ' (force)' : ''}`);
    return true;
  } catch (error) {
    console.error('❌ Error syncing database:', error);
    throw error;
  }
};

// Reset database (drop and recreate all tables)
const resetDatabase = async () => {
  console.log('Starting database reset...');
  try {
    await syncDatabase(true);
    console.log('✅ Database reset completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to reset database:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase,
  resetDatabase
};