// This is the entry point for Vercel serverless functions
const { createServer } = require('http');
const { parse } = require('url');

// Import the Express app from your backend
const app = require('../backend/server/server').default;

// Create a simple HTTP server that routes requests to Express
module.exports = (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      return res.end();
    }

    // Handle the request with Express
    return app(req, res);
  } catch (err) {
    console.error('Error:', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
};
