import mysql from 'mysql2/promise';
import 'dotenv/config';

const testConnection = async () => {
  console.log('\nTesting MySQL Connection:');
  console.log('=======================\n');

  const config = {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE_NAME || 'student_expense_tracker',
    port: process.env.MYSQL_PORT || 3306
  };

  console.log('Connection Configuration:');
  console.log('------------------------');
  console.log('Host:', config.host);
  console.log('User:', config.user);
  console.log('Database:', config.database);
  console.log('Port:', config.port);
  console.log('\nAttempting connection...\n');

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Connection successful!');
    
    // Test query
    const [rows] = await connection.execute('SELECT VERSION() as version');
    console.log('\nMySQL Version:', rows[0].version);
    
    // Test database access
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('\nAccessible Databases:');
    databases.forEach(db => console.log(`- ${db.Database}`));
    
    await connection.end();
    console.log('\n✅ All tests passed successfully!');
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('\nError Details:');
    console.error('-------------');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Stack:', error.stack);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\nPossible solutions:');
      console.error('1. Check if MySQL is running');
      console.error('2. Verify the host and port are correct');
      console.error('3. Check if firewall is blocking connections');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\nPossible solutions:');
      console.error('1. Verify username and password');
      console.error('2. Check if user has proper privileges');
      console.error('3. Ensure user is allowed to connect from your IP');
    }
    
    process.exit(1);
  }
};

testConnection(); 