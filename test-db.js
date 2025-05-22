const { Sequelize } = require('sequelize');

async function testConnection() {
  const sequelize = new Sequelize('student_expense_tracker', 'root', '1234', {
    host: 'localhost',
    dialect: 'mysql',
    logging: console.log
  });

  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // Check if database exists
    const [results] = await sequelize.query("SHOW DATABASES LIKE 'student_expense_tracker'");
    if (results.length === 0) {
      console.log('Database does not exist. Creating database...');
      await sequelize.query("CREATE DATABASE IF NOT EXISTS student_expense_tracker");
      console.log('Database created successfully.');
    } else {
      console.log('Database exists.');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

testConnection();
