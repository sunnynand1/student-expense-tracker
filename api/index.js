// This is the entry point for Vercel serverless functions
const { createServer } = require('http');
const { parse } = require('url');
const express = require('express');
const cors = require('cors');

// Create a new Express app
const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Import the database connection and initialize it
const { sequelize, testConnection } = require('../backend/config/db');

// Import routes from your backend
const apiRoutes = require('../backend/routes');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ status: 'success', message: 'API is working!' });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await testConnection();
    res.json({
      status: 'ok',
      message: 'Server and database are running',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Use your API routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Not Found'
  });
});

// For local development, we'll use the main backend server
// This file is primarily for Vercel deployment
if (process.env.VERCEL !== '1') {
  console.log('⚠️  Running in local development mode');
  console.log('ℹ️  Start the server using: cd backend && npm run dev');
  console.log('    or use: npm run dev in the root directory if configured');
}

// Export the Express API for Vercel
module.exports = app;
