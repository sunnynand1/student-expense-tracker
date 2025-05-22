// This file is specifically for Vercel serverless functions
const express = require('express');
const server = require('../backend/server');

// Create a new Express app for Vercel
const app = express();

// Use the server's middleware and routes
app.use(server.app);

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Export the Express app as a serverless function
module.exports = app;
