import express from 'express';
import { sequelize } from '../config/db.js';
import { DataTypes } from 'sequelize';

const router = express.Router();

// Add a simple connection test endpoint
router.get('/connection', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: 'success',
      message: 'Database connection successful',
      timestamp: new Date().toISOString(),
      database: {
        host: process.env.MYSQL_HOST,
        name: process.env.MYSQL_DATABASE_NAME,
        connected: true
      }
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

// Create a test model
const TestEntry = sequelize.define('TestEntry', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

// Create test data
router.post('/create', async (req, res) => {
  try {
    // Ensure the table exists
    await TestEntry.sync();

    // Create a test entry
    const entry = await TestEntry.create({
      message: 'Test entry created at ' + new Date().toISOString()
    });

    res.json({
      success: true,
      data: entry,
      message: 'Test entry created successfully'
    });
  } catch (error) {
    console.error('Test create error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Read test data
router.get('/read', async (req, res) => {
  try {
    const entries = await TestEntry.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    res.json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    console.error('Test read error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Clean up test data
router.delete('/cleanup', async (req, res) => {
  try {
    await TestEntry.destroy({
      where: {},
      truncate: true
    });

    res.json({
      success: true,
      message: 'All test entries deleted successfully'
    });
  } catch (error) {
    console.error('Test cleanup error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

export default router; 