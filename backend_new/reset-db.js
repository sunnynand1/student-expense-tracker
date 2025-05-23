const { sequelize, syncDatabase } = require('./config/db');

async function resetDatabase() {
  try {
    console.log('Starting database reset...');
    
    // Force sync will drop all tables and recreate them
    await syncDatabase(true);
    
    console.log('✅ Database reset completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase();
