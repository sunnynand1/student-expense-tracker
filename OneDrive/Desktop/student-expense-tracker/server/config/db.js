import { Sequelize } from 'sequelize';

// Database configuration
const dbConfig = {
  HOST: 'localhost',
  USER: 'root',          // MySQL username
  PASSWORD: '1234',      // MySQL password
  DB: 'student_expense_tracker',
  dialect: 'mysql',
  logging: false,        // Disable logging for now
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

// Create Sequelize instance
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  logging: dbConfig.logging,
  pool: dbConfig.pool,
  define: {
    timestamps: true,
    underscored: true
  },
  dialectOptions: {
    // Add this for proper timezone handling
    useUTC: false,
    dateStrings: true,
    typeCast: true,
    timezone: '+05:30'  // IST timezone
  },
  timezone: '+05:30' // Set your timezone here
});

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    return false;
  }
};

// Sync all models
const syncDatabase = async () => {
  try {
    console.log('🔍 Starting database sync...');
    
    // First, drop all tables if they exist
    console.log('Dropping existing tables...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.dropAllSchemas();
    await sequelize.sync({ force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    
    // Then sync all models
    console.log('Creating tables...');
    await sequelize.sync();
    
    console.log('✅ Database & tables created!');
    return true;
  } catch (error) {
    console.error('❌ Unable to sync database:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.parent) {
      console.error('Database error code:', error.parent.code);
      console.error('Database error number:', error.parent.errno);
      console.error('SQL:', error.parent.sql);
    }
    return false;
  }
};

// Export the configured sequelize instance and config
export {
  sequelize,
  testConnection,
  syncDatabase,
  dbConfig
};

export default sequelize;

// Test the connection when this module is required (without syncing)
(async () => {
  try {
    await testConnection();
  } catch (error) {
    console.error('❌ Error connecting to database:', error);
  }
})();
