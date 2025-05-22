import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import config from './config/config.js';

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration
app.use(cors(config.cors));

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

export default app; 