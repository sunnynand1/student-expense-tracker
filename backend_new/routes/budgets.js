const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { Budget, User } = require('../models');
const auth = require('../middleware/auth');

// @route   GET api/budgets
// @desc    Get all budgets for the logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const budgets = await Budget.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          attributes: ['id', 'username']
        }
      ]
    });
    res.json(budgets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/budgets
// @desc    Add a new budget
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('amount', 'Amount is required').isNumeric(),
      check('category', 'Category is required').not().isEmpty(),
      check('startDate', 'Start date is required').isISO8601(),
      check('endDate', 'End date is required').isISO8601()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, category, startDate, endDate, notes } = req.body;

    try {
      // Check if budget already exists for this category and date range
      const existingBudget = await Budget.findOne({
        where: {
          userId: req.user.id,
          category,
          [Op.or]: [
            {
              startDate: {
                [Op.between]: [startDate, endDate]
              }
            },
            {
              endDate: {
                [Op.between]: [startDate, endDate]
              }
            },
            {
              startDate: { [Op.lte]: startDate },
              endDate: { [Op.gte]: endDate }
            }
          ]
        }
      });

      if (existingBudget) {
        return res.status(400).json({
          errors: [{ msg: 'Budget already exists for this category and date range' }]
        });
      }

      const newBudget = await Budget.create({
        userId: req.user.id,
        amount,
        category,
        startDate,
        endDate,
        notes: notes || ''
      });

      // Return the new budget with user data
      const budgetWithUser = await Budget.findByPk(newBudget.id, {
        include: [
          {
            model: User,
            attributes: ['id', 'username']
          }
        ]
      });

      res.json(budgetWithUser);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/budgets/:id
// @desc    Update a budget
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { amount, category, startDate, endDate, notes } = req.body;

  // Build budget object
  const budgetFields = {};
  if (amount) budgetFields.amount = amount;
  if (category) budgetFields.category = category;
  if (startDate) budgetFields.startDate = startDate;
  if (endDate) budgetFields.endDate = endDate;
  if (notes !== undefined) budgetFields.notes = notes;

  try {
    let budget = await Budget.findByPk(req.params.id);

    if (!budget) {
      return res.status(404).json({ msg: 'Budget not found' });
    }

    // Make sure user owns the budget
    if (budget.userId !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    budget = await budget.update(budgetFields);

    // Return the updated budget with user data
    const budgetWithUser = await Budget.findByPk(budget.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'username']
        }
      ]
    });

    res.json(budgetWithUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/budgets/:id
// @desc    Delete a budget
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.findByPk(req.params.id);

    if (!budget) {
      return res.status(404).json({ msg: 'Budget not found' });
    }

    // Make sure user owns the budget
    if (budget.userId !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await budget.destroy();

    res.json({ msg: 'Budget removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
