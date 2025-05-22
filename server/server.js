import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { testConnection, syncDatabase, sequelize } from './config/db.js';
import authRoutes from './routes/auth_updated.js';
import expenseRoutes from './routes/expenses.js';
import budgetRoutes from './routes/budgets.js';
import bcrypt from 'bcryptjs';
import { User, Expense, Budget } from './models/index.js';

// Initialize models with associations
const initModels = async () => {
  try {
    // Import all models
    console.log('Initializing models and associations...');
    
    // Set up associations
    User.hasMany(Expense, { foreignKey: 'user_id', as: 'expenses' });
    Expense.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
    
    User.hasMany(Budget, { foreignKey: 'user_id', as: 'budgets' });
    Budget.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
    
    console.log('✅ Models and associations initialized');
  } catch (error) {
    console.error('❌ Error initializing models:', error);
    throw error;
  }
};

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000; // Changed to 5000

// For Vercel compatibility
app.set('json spaces', 2);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3006',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3006',
  process.env.FRONTEND_URL
].filter(Boolean);

// CORS middleware with more permissive configuration for development
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['set-cookie'],
  optionsSuccessStatus: 200
}));

// Routes
app.use('/auth', authRoutes);
app.use('/expenses', expenseRoutes);
app.use('/budgets', budgetRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const startServer = async () => {
  try {
    console.log('🚀 Starting server...');
    
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Could not connect to the database');
    }
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`\n✅ Server is running on http://localhost:${PORT}`);
      console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📅 ${new Date().toLocaleString()}`);
      console.log('\n📚 Available endpoints:');
      console.log(`   - GET  /health`);
      console.log(`   - POST /auth/register`);
      console.log(`   - POST /auth/login`);
      console.log(`   - GET  /expenses`);
      console.log(`   - GET  /budgets`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Export the Express app for testing
export default app;
