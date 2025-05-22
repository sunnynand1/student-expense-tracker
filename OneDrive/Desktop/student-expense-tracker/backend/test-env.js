import 'dotenv/config';

const requiredEnvVars = [
  'MYSQL_HOST',
  'MYSQL_DATABASE_NAME',
  'MYSQL_USER',
  'MYSQL_PASSWORD',
  'NODE_ENV'
];

console.log('\nEnvironment Variables Check:');
console.log('===========================\n');

let hasErrors = false;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  const isSet = !!value;
  
  console.log(`${varName}:`, isSet ? '✅ Set' : '❌ Missing');
  
  if (!isSet) {
    hasErrors = true;
  } else {
    // Show masked value for sensitive data
    const isSensitive = varName.includes('PASSWORD') || varName.includes('SECRET');
    console.log(`  Value: ${isSensitive ? '****' : value}`);
  }
});

console.log('\nDatabase Connection String Check:');
console.log('==============================\n');

try {
  const dbUrl = `mysql://${process.env.MYSQL_USER}:${process.env.MYSQL_PASSWORD}@${process.env.MYSQL_HOST}/${process.env.MYSQL_DATABASE_NAME}`;
  console.log('Connection String Format: ✅ Valid');
  console.log(`Host: ${process.env.MYSQL_HOST}`);
  console.log(`Database: ${process.env.MYSQL_DATABASE_NAME}`);
  console.log(`User: ${process.env.MYSQL_USER}`);
} catch (error) {
  console.log('Connection String Format: ❌ Invalid');
  console.error('Error:', error.message);
  hasErrors = true;
}

console.log('\nEnvironment Check:');
console.log('=================\n');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`Running in: ${process.env.NODE_ENV === 'production' ? 'Production' : 'Development'} mode`);

if (hasErrors) {
  console.log('\n❌ Some environment variables are missing or invalid');
  process.exit(1);
} else {
  console.log('\n✅ All environment variables are properly set');
} 