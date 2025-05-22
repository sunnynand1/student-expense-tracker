-- Create a new user for remote access
CREATE USER 'student_expense_user'@'%' IDENTIFIED BY 'your_strong_password_here';

-- Grant privileges to the new user
GRANT ALL PRIVILEGES ON student_expense_tracker.* TO 'student_expense_user'@'%';

-- If the database doesn't exist, create it
CREATE DATABASE IF NOT EXISTS student_expense_tracker;

-- Flush privileges to apply changes
FLUSH PRIVILEGES; 