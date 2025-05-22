import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const {
  MYSQL_HOST = 'localhost',
  MYSQL_USER = 'root',
  MYSQL_PASSWORD = '1234',
  MYSQL_PORT = 3306
} = process.env;

async function setupDatabase() {
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: MYSQL_HOST,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      port: MYSQL_PORT
    });

    console.log('Connected to MySQL server');

    // Create database
    await connection.query('CREATE DATABASE IF NOT EXISTS student_expense_tracker');
    console.log('Database created or already exists');

    // Use the database
    await connection.query('USE student_expense_tracker');

    // Drop existing tables
    await connection.query('DROP TABLE IF EXISTS expenses');
    await connection.query('DROP TABLE IF EXISTS users');
    console.log('Dropped existing tables');

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        username VARCHAR(20) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        last_login DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_username (username),
        KEY idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Created users table');

    // Create expenses table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        notes TEXT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        KEY idx_user_id (user_id),
        KEY idx_date (date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Created expenses table');

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    await connection.query(`
      INSERT INTO users (name, username, email, password, is_active, created_at, updated_at)
      VALUES (
        'Test User',
        'testuser',
        'test@example.com',
        ?,
        TRUE,
        NOW(),
        NOW()
      )
      ON DUPLICATE KEY UPDATE updated_at = NOW()
    `, [hashedPassword]);
    console.log('Created test user');

    // Grant privileges
    await connection.query(`
      CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY '1234'
    `);
    await connection.query(`
      GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION
    `);
    await connection.query('FLUSH PRIVILEGES');
    console.log('Granted necessary privileges');

    // Close connection
    await connection.end();
    console.log('Database setup completed successfully');

  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase(); 