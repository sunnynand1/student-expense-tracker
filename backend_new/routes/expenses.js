const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { Expense, User } = require('../models');
const auth = require('../middleware/auth');

// @route   GET api/expenses
// @desc    Get all expenses for the logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      where: { userId: req.user.id },
      order: [['date', 'DESC']],
      include: [
        {
          model: User,
          attributes: ['id', 'username']
        }
      ]
    });
    res.json(expenses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/expenses
// @desc    Add a new expense
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('amount', 'Amount is required').isNumeric(),
      check('description', 'Description is required').not().isEmpty(),
      check('category', 'Category is required').not().isEmpty(),
      check('date', 'Date is required').isISO8601()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, description, category, date, notes } = req.body;

    try {
      const newExpense = await Expense.create({
        userId: req.user.id,
        amount,
        description,
        category,
        date,
        notes: notes || ''
      });

      // Return the new expense with user data
      const expenseWithUser = await Expense.findByPk(newExpense.id, {
        include: [
          {
            model: User,
            attributes: ['id', 'username']
          }
        ]
      });

      res.json(expenseWithUser);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/expenses/:id
// @desc    Update an expense
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { amount, description, category, date, notes } = req.body;

  // Build expense object
  const expenseFields = {};
  if (amount) expenseFields.amount = amount;
  if (description) expenseFields.description = description;
  if (category) expenseFields.category = category;
  if (date) expenseFields.date = date;
  if (notes !== undefined) expenseFields.notes = notes;

  try {
    let expense = await Expense.findByPk(req.params.id);

    if (!expense) {
      return res.status(404).json({ msg: 'Expense not found' });
    }

    // Make sure user owns the expense
    if (expense.userId !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    expense = await expense.update(expenseFields);

    // Return the updated expense with user data
    const expenseWithUser = await Expense.findByPk(expense.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'username']
        }
      ]
    });

    res.json(expenseWithUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/expenses/:id
// @desc    Delete an expense
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);

    if (!expense) {
      return res.status(404).json({ msg: 'Expense not found' });
    }

    // Make sure user owns the expense
    if (expense.userId !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await expense.destroy();

    res.json({ msg: 'Expense removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
