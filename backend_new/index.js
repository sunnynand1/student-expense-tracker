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
const corsOptions = {
  origin: function(origin, callback) {
    console.log('Incoming origin:', origin);
    
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      console.log('Allowing all origins in development');
      return callback(null, true);
    }
    
    // In production, only allow specific origins
    const allowedOrigins = [
      /^https?:\/\/student-expense-tracker(-\w+)?\.vercel\.app$/, // Vercel deployments
      /^https?:\/\/.*\.vercel\.app$/, // All Vercel preview deployments
      /^https?:\/\/student-expense-tracker\.com$/, // Production domain
      /^https?:\/\/www\.student-expense-tracker\.com$/, // www subdomain
      /^http:\/\/localhost(:[0-9]+)?$/, // Localhost with any port
      /^https?:\/\/localhost(:[0-9]+)?$/, // Localhost with any port and https
      /^https?:\/\/student-expense-tracker-frontend\.vercel\.app$/, // Frontend Vercel deployment
      /^https?:\/\/student-expense-tracker-git-\w+-sunnynand1\.vercel\.app$/ // Vercel preview deployments
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('No origin header, allowing request');
      return callback(null, true);
    }
    
    // Check if the origin matches any of the allowed patterns
    const isAllowed = allowedOrigins.some(regex => {
      const matches = regex.test(origin);
      if (matches) {
        console.log(`Origin ${origin} matched pattern:`, regex.toString());
      }
      return matches;
    });
    
    if (!isAllowed) {
      console.warn(`Blocked request from origin: ${origin}`);
    } else {
      console.log(`Allowed request from origin: ${origin}`);
    }
    
    callback(null, isAllowed);
  },
  credentials: true, // Allow cookies to be sent with requests
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-Auth-Token', 'X-API-Key'],
  exposedHeaders: ['Content-Range', 'X-Total-Count'],
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  maxAge: 600 // Cache preflight request for 10 minutes
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Add CORS headers to all responses
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Define allowed origins for this middleware (same as above)
  const allowedOrigins = [
    /^https?:\/\/student-expense-tracker(-\w+)?\.vercel\.app$/,
    /^https?:\/\/.*\.vercel\.app$/,
    /^https?:\/\/student-expense-tracker\.com$/,
    /^https?:\/\/www\.student-expense-tracker\.com$/,
    /^http:\/\/localhost(:[0-9]+)?$/,
    /^https?:\/\/localhost(:[0-9]+)?$/
  ];
  
  // Check if the origin is allowed
  const isAllowed = !origin || allowedOrigins.some(regex => regex.test(origin));
  
  if (isAllowed && origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, X-Auth-Token, X-API-Key');
  }
  
  next();
});

// Simple health check endpoint
app.get('/api/health/check', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'connected',
    environment: process.env.NODE_ENV || 'development'
  });
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
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Log all available routes
    console.log('\nAvailable routes:');
    console.log(`- GET  /api/health`);
    console.log(`- POST /api/auth/register`);
    console.log(`- POST /api/auth/login`);
    console.log(`- GET  /api/expenses`);
    console.log(`- POST /api/expenses`);
    console.log(`- GET  /api/budgets`);
    console.log(`- POST /api/budgets`);

    // Only start the server if not in Vercel environment
    if (process.env.VERCEL !== '1') {
      const server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
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
    }
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
