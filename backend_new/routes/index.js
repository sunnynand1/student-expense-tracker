const express = require('express');
const router = express.Router();

// Import route handlers
const authRoutes = require('./auth');
const expenseRoutes = require('./expenses');
const budgetRoutes = require('./budgets');

// Use routes
router.use('/auth', authRoutes);
router.use('/expenses', expenseRoutes);
router.use('/budgets', budgetRoutes);

module.exports = router;
