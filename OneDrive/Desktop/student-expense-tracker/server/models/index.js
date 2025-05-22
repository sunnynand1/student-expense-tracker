import User from './User.js';
import Expense from './Expense.js';
import Budget from './Budget.js';

// Set up User-Expense relationship
User.hasMany(Expense, {
  foreignKey: 'user_id',
  as: 'expenses'
});

Expense.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Set up User-Budget relationship
User.hasMany(Budget, {
  foreignKey: 'user_id',
  as: 'budgets'
});

Budget.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

export { User, Expense, Budget };
