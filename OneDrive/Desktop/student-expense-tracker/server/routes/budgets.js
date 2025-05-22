import express from 'express';
const router = express.Router();
import { sequelize } from '../config/db.js';
import auth from '../middleware/auth.js';
import { Op } from 'sequelize';
import Budget from '../models/Budget.js';

// @route   GET api/budgets
// @desc    Get all budgets for the logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching budgets for user:', req.user.id);
    const budgets = await Budget.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });
    console.log('Budgets found:', budgets);
    res.json(budgets);
  } catch (err) {
    console.error('Error fetching budgets:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// @route   POST api/budgets
// @desc    Create or update a budget
// @access  Private
router.post('/', auth, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { category, allocated, period } = req.body;
    
    // Validate input
    if (!category || typeof allocated !== 'number' || allocated < 0 || !period) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Please provide valid category, allocated amount, and period' });
    }
    
    // Check if budget already exists for this category and period
    const [budget, created] = await Budget.findOrCreate({
      where: {
        user_id: req.user.id,
        category,
        period
      },
      defaults: {
        user_id: req.user.id,
        category,
        allocated,
        period
      },
      transaction
    });
    
    if (!created) {
      // Update existing budget
      budget.allocated = allocated;
      await budget.save({ transaction });
    }
    
    await transaction.commit();
    res.status(created ? 201 : 200).json(budget);
  } catch (err) {
    await transaction.rollback();
    console.error('Error saving budget:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// @route   DELETE api/budgets/:id
// @desc    Delete a budget
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await Budget.destroy({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });
    
    if (result === 0) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    
    res.json({ message: 'Budget removed' });
  } catch (err) {
    console.error('Error deleting budget:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

export default router;
