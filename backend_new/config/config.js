require('dotenv').config();

const config = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
    expiresIn: '24h'
  },
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
    maxAge: 600
  },
  database: {
    dialect: 'mysql',
    host: process.env.DB_HOST || 'mysql.railway.internal',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'railway',
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
if (safeConfig.database) {
  safeConfig.database = { ...safeConfig.database };
  if (safeConfig.database.password) {
    safeConfig.database.password = '******';
  }
}

console.log('Configuration loaded:', safeConfig);

module.exports = config;