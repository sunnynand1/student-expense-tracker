const express = require('express');
const router = express.Router();

// Import route handlers
const authRoutes = require('./auth');
const budgetRoutes = require('./budgets');
const expenseRoutes = require('./expenses');
const testRoutes = require('./test');

// Use routes
router.use('/auth', authRoutes);
router.use('/budgets', budgetRoutes);
router.use('/expenses', expenseRoutes);
router.use('/test', testRoutes);

// Export the router
module.exports = router;
