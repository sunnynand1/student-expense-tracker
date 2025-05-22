require('dotenv').config();

const config = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
    expiresIn: '24h'
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
    maxAge: 600
  },
  database: {
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || './database.sqlite',
    logging: false
  },
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    env: process.env.NODE_ENV || 'development'
  }
};

// Add helper properties
config.isProduction = config.server.env === 'production';
config.isDevelopment = !config.isProduction;

// Log configuration (but hide sensitive data)
const safeConfig = { ...config };
safeConfig.database.password = '***';
console.log('Configuration loaded:', JSON.stringify(safeConfig, null, 2));

module.exports = config;
