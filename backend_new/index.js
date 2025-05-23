require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const { sequelize } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5001;

// Log environment for debugging
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Server starting on port:', PORT);

// Basic middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5001',
  'http://localhost:5173',
  'https://student-expense-tracker-gilt.vercel.app',
  'https://student-expense-tracker.vercel.app',
  'https://student-expense-tracker-frontend.vercel.app',
  'https://student-expense-tracker-api.vercel.app',
  'https://student-expense-tracker-sunny.vercel.app',
  'https://student-expense-tracker-git-main-sunnynand1s-projects.vercel.app',
  'https://student-expense-tracker-*.vercel.app', // Wildcard for preview deployments
  'https://*.vercel.app' // Allow all Vercel preview deployments
];

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Auth-Token, X-API-Key');
    return res.status(200).json({});
  }
  
  // Allow requests from any origin in development
  if (process.env.NODE_ENV === 'development') {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
  } 
  // In production, check against allowed origins
  else {
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        const regex = new RegExp(allowedOrigin.replace('*', '.*'));
        return regex.test(origin);
      }
      return origin === allowedOrigin;
    });
    
    if (isAllowed) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
    } else if (origin) {
      console.warn('Blocked request from origin:', origin);
      return res.status(403).json({ error: 'Origin not allowed' });
    }
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Auth-Token, X-API-Key');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// API Routes
const healthRouter = require('./api/health');
app.use('/api/health', healthRouter);

// Application Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/budgets', require('./routes/budgets'));

// Root route
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    documentation: 'Use /api/health for health checks',
    endpoints: ['/api/health', '/api/auth', '/api/expenses', '/api/budgets']
  });
});

// Handle favicon.ico requests to prevent 404 errors
app.get('/favicon.ico', (req, res) => res.status(204).end());

// 404 handler - catch 404 and forward to error handler
app.use((req, res, next) => {
  res.status(404).json({ 
    status: 'error',
    message: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    
    return res.status(400).json({
      status: 'error',
      message: 'Validation Error',
      errors
    });
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication failed',
      error: err.message
    });
  }
  
  // Default error handler
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { 
      error: err.message,
      stack: err.stack 
    })
  });
});

// Database connection and server initialization
const startServer = async () => {
  try {
    // For SQLite, we'll skip the authentication test
    if (process.env.NODE_ENV !== 'test') {
      console.log('🔍 Testing database connection...');
      await sequelize.authenticate();
      console.log('✅ Database connection established.');

      // Sync database models
      console.log('🔄 Syncing database models...');
      await sequelize.sync({ force: false, alter: true });
      console.log('✅ Database models synced.');
    }

    // Start server
    const server = app.listen(PORT, '0.0.0.0', () => {
      const address = server.address();
      const host = address.address === '::' ? 'localhost' : address.address;
      console.log(`🚀 Server running on http://${host}:${address.port}`);
      console.log(`🌐 Try: http://localhost:${address.port}/api/health`);
      console.log(`📊 Database: ${process.env.DATABASE_STORAGE || 'Not specified'}`);
      
      // Log all available routes
      console.log('\nAvailable routes:');
      console.log(`- GET  /api/health`);
      console.log(`- POST /api/auth/register`);
      console.log(`- POST /api/auth/login`);
      console.log(`- GET  /api/expenses`);
      console.log(`- POST /api/expenses`);
      console.log(`- GET  /api/budgets`);
      console.log(`- POST /api/budgets`);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use.`);
        console.log('Try one of these solutions:');
        console.log(`1. Stop the other process using port ${PORT}`);
        console.log(`2. Use a different port by setting the PORT environment variable`);
        console.log('   Example: `set PORT=3002 && npm start`');
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });
    
    // Handle process termination
    process.on('SIGTERM', () => {
      console.log('\n🚦 SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('💤 Server stopped');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;
