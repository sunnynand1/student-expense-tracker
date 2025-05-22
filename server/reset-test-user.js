const bcrypt = require('bcryptjs');
const { sequelize } = require('./config/db');
const User = require('./models/User');

async function resetTestUser() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Find the test user
    const testUser = await User.findOne({ where: { email: 'test@example.com' } });
    
    if (!testUser) {
      console.log('❌ Test user not found');
      return;
    }

    // Reset password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    await testUser.update({ password: hashedPassword });
    console.log('✅ Test user password has been reset to: password123');
    
  } catch (error) {
    console.error('❌ Error resetting test user:', error);
  } finally {
    await sequelize.close();
  }
}

resetTestUser();
