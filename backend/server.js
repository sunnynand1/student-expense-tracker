import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { StatusCodes } from 'http-status-codes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { testConnection, syncDatabase } from './config/db.js';
import config from './config/config.js';
import logger from './config/logger.js';

// Import routes
import authRoutes from './routes/auth.js';
import budgetRoutes from './routes/budgets.js';
import expenseRoutes from './routes/expenses.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors(config.cors));

// Request logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Basic middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(StatusCodes.OK).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.server.env
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/expenses', expenseRoutes);

// Initialize database
const initializeApp = async () => {
  try {
    await testConnection();
    await syncDatabase();
    logger.info('✅ Database initialized successfully');
  } catch (error) {
    logger.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }
};

// Initialize the application
initializeApp();

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Student Expense Tracker API',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: config.server.env
  });
});

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.server.env
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start the server
const startServer = async () => {
  try {
    // Initialize database
    await testConnection();
    await syncDatabase();
    
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`🌐 Environment: ${config.server.env}`);
      console.log(`🕒 ${new Date().toISOString()}`);
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

// Start the application
startServer();

export default app; 