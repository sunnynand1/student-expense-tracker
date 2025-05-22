import { Sequelize } from 'sequelize';

// Get environment variables with fallbacks
const {
  MYSQL_DATABASE_NAME,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_HOST,
  MYSQL_PORT,
  NODE_ENV
} = process.env;

// Validate required environment variables
const requiredEnvVars = {
  MYSQL_DATABASE_NAME,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_HOST,
  MYSQL_PORT
};

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

// Connection configuration
const config = {
  host: MYSQL_HOST,
  port: parseInt(MYSQL_PORT, 10),
  dialect: 'mysql',
  logging: NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    connectTimeout: 60000
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 60000,
    idle: 10000,
    evict: 1000
  },
  retry: {
    match: [
      /Deadlock/i,
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/,
      /TimeoutError/,
      /SequelizeConnectionAcquireTimeoutError/
    ],
    max: 5,
    backoffBase: 1000,
    backoffExponent: 1.5
  }
};

// Create Sequelize instance
const sequelize = new Sequelize(
  MYSQL_DATABASE_NAME,
  MYSQL_USER,
  MYSQL_PASSWORD,
  config
);

let isConnected = false;
let connectionAttempts = 0;
const MAX_ATTEMPTS = 3;

export const testConnection = async () => {
  try {
    if (!isConnected) {
      connectionAttempts++;
      console.log(`Connection attempt ${connectionAttempts}/${MAX_ATTEMPTS}`);
      
      await sequelize.authenticate();
      
      console.log('✅ Database connection established successfully.');
      console.log(`Environment: ${NODE_ENV}`);
      console.log(`Database Host: ${MYSQL_HOST}`);
      console.log(`Database Name: ${MYSQL_DATABASE_NAME}`);
      
      isConnected = true;
      connectionAttempts = 0;
    }
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    console.error(`Environment: ${NODE_ENV}`);
    console.error(`Database Host: ${MYSQL_HOST}`);
    console.error(`Database Name: ${MYSQL_DATABASE_NAME}`);
    
    isConnected = false;
    
    if (connectionAttempts >= MAX_ATTEMPTS) {
      console.error(`Maximum connection attempts (${MAX_ATTEMPTS}) reached`);
      throw new Error(`Database connection failed after ${MAX_ATTEMPTS} attempts: ${error.message}`);
    }
    
    throw error;
  }
};

export const syncDatabase = async () => {
  try {
    if (!isConnected) {
      await testConnection();
    }
    // Only sync in development
    if (NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database synchronized successfully.');
    }
  } catch (error) {
    console.error('❌ Unable to sync database:', error.message);
    throw error;
  }
};

// Handle connection events
sequelize.addHook('beforeConnect', async (config) => {
  console.log(`[${new Date().toISOString()}] Attempting database connection...`);
});

sequelize.addHook('afterConnect', async (connection) => {
  console.log(`[${new Date().toISOString()}] Database connection successful`);
  isConnected = true;
});

sequelize.addHook('beforeDisconnect', async (connection) => {
  console.log(`[${new Date().toISOString()}] Database disconnecting...`);
  isConnected = false;
});

// Handle process termination
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing database connections...');
  try {
    await sequelize.close();
    console.log('Database connections closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error closing database connections:', error);
    process.exit(1);
  }
});

export { sequelize }; 