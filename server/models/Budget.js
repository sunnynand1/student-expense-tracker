import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Budget = sequelize.define('Budget', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  allocated: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  spent: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  period: {
    type: DataTypes.ENUM('weekly', 'monthly', 'yearly'),
    defaultValue: 'monthly',
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW,
  },
}, {
  tableName: 'budgets',
  timestamps: false,
  underscored: true,
});

export default Budget;
