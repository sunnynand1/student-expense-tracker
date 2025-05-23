require('dotenv').config();

const config = {
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '24h'
  },
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
    maxAge: 600
  },
  server: {
    port: parseInt(process.env.PORT, 10),
    env: process.env.NODE_ENV
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