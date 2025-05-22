import mysql from 'mysql2/promise';

const config = {
  host: '127.0.0.1',
  user: 'root',
  password: '1234',
  database: 'student_expense_tracker'
};

async function testConnection() {
  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Connected to MySQL successfully!');
    
    // Test query
    const [rows] = await connection.execute('SELECT VERSION() as version');
    console.log('MySQL Version:', rows[0].version);
    
    await connection.end();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection(); 