import mysql from 'mysql2/promise';

const config = {
  host: 'crossover.proxy.rlwy.net',
  port: 35371,
  user: 'root',
  password: 'FEOjsLgKMgfNdbnJhIxrrfOQsiUKTsRq',
  database: 'railway',
  ssl: {
    rejectUnauthorized: false
  },
  connectTimeout: 60000,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

async function testRailwayConnection() {
  let connection;
  try {
    console.log('Attempting to connect to Railway MySQL database...');
    console.log('Connection config:', {
      host: config.host,
      port: config.port,
      user: config.user,
      database: config.database
    });
    
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to Railway MySQL successfully!');
    
    // Test query
    const [rows] = await connection.execute('SELECT VERSION() as version');
    console.log('MySQL Version:', rows[0].version);
    
    // Create test table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS test_connection (
        id INT AUTO_INCREMENT PRIMARY KEY,
        message VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Test table created successfully');
    
    // Insert test data
    await connection.execute(`
      INSERT INTO test_connection (message) VALUES ('Test connection successful')
    `);
    console.log('✅ Test data inserted successfully');
    
    // Read test data
    const [testData] = await connection.execute('SELECT * FROM test_connection');
    console.log('\nTest Data:', testData);
    
    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    console.error('Error details:', error);
    
    if (error.code === 'ETIMEDOUT') {
      console.error('\nPossible solutions:');
      console.error('1. Check if your IP is allowlisted in Railway');
      console.error('2. Verify the hostname is correct');
      console.error('3. Try using a different port');
    }
  } finally {
    if (connection) {
      try {
        await connection.end();
        console.log('Connection closed successfully');
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

testRailwayConnection(); 