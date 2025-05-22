import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Placeholder route for budgets
router.get('/', authenticateToken, (req, res) => {
  res.json({ message: 'Budgets feature coming soon!' });
});

export default router; 