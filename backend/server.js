import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { testConnection, syncDatabase, sequelize } from './config/db.js';
import authRoutes from './routes/auth.js';
import expenseRoutes from './routes/expenses.js';
import budgetRoutes from './routes/budgets.js';
import testRoutes from './routes/test.js';

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Basic middleware
app.use(express.json());
app.use(cookieParser());

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://your-production-domain.com'
    : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-CSRF-Token',
    'X-Requested-With',
    'Accept',
    'Accept-Version',
    'Content-Length',
    'Content-MD5',
    'Date',
    'X-Api-Version'
  ]
};

app.use(cors(corsOptions));

// Initialize database
(async () => {
  try {
    await testConnection();
    await syncDatabase();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    // Don't exit process, let the app continue without DB
  }
})();

// Root endpoint - No database connection required
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Student Expense Tracker API',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      expenses: '/api/expenses/*',
      budgets: '/api/budgets/*',
      test: '/api/test/*'
    }
  });
});

// Health check endpoint - Includes database status but won't fail if DB is down
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: {
      configured: !!(process.env.MYSQL_HOST && process.env.MYSQL_DATABASE_NAME),
      connected: false,
      host: process.env.MYSQL_HOST,
      name: process.env.MYSQL_DATABASE_NAME
    }
  };

  try {
    await testConnection();
    health.database.connected = true;
  } catch (error) {
    health.database.connected = false;
    health.database.error = process.env.NODE_ENV === 'development' ? error.message : 'Connection failed';
    console.error('Health check - Database error:', error);
  }

  res.status(health.database.connected ? 200 : 503).json(health);
});

// Database connection middleware - Only for API routes
app.use('/api', async (req, res, next) => {
  // Skip database check for health endpoint
  if (req.path === '/health') {
    return next();
  }

  try {
    await testConnection();
    next();
  } catch (error) {
    console.error('Database middleware error:', error);
    res.status(503).json({
      error: 'Database Service Unavailable',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Database connection failed',
      path: req.path
    });
  }
});

// API routes
app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Final error handling
app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Handle specific error types
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === 'SequelizeConnectionError' ||
      err.name === 'SequelizeConnectionRefusedError' ||
      err.name === 'SequelizeHostNotFoundError' ||
      err.name === 'SequelizeHostNotReachableError') {
    return res.status(503).json({
      error: 'Database Service Unavailable',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Database connection error'
    });
  }

  // Generic error response
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

export default app; 