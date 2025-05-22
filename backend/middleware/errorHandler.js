/**
 * Centralized error handling middleware
 */

export const errorHandler = (err, req, res, next) => {
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

  // Database connection errors
  const dbErrors = [
    'SequelizeConnectionError',
    'SequelizeConnectionRefusedError',
    'SequelizeHostNotFoundError',
    'SequelizeHostNotReachableError'
  ];

  if (dbErrors.includes(err.name)) {
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
};

// 404 handler
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
};
