// Main entry point for the backend application
const app = require('./server/server');
const { sequelize } = require('./config/db');
const config = require('./config/config');

// Use a different port to avoid conflicts
const PORT = process.env.PORT || 5001;

// Start the server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Sync models in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔄 Syncing database models...');
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synced.');
    }

    // Start listening
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please check for other running instances.`);
        console.log('Try one of these solutions:');
        console.log(`1. Stop the other process using port ${PORT}`);
        console.log(`2. Use a different port by setting the PORT environment variable`);
        console.log('   Example: `set PORT=5002 && npm start`');
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
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

// Export the app for testing
module.exports = app;
