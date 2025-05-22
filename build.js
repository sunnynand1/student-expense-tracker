const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure we're in production mode
process.env.NODE_ENV = 'production';
// Disable CI environment to prevent treating warnings as errors
process.env.CI = 'false';

try {
  // Create necessary directories
  ['src/styles', 'build/static/css'].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  console.log('📦 Installing dependencies...');
  execSync('npm install --production=false', { stdio: 'inherit' });

  console.log('🎨 Generating CSS...');
  execSync('npx tailwindcss -i ./src/index.css -o ./src/styles/tailwind.css --minify', { stdio: 'inherit' });

  console.log('🏗️ Building application...');
  execSync('react-scripts build', { stdio: 'inherit' });

  console.log('✅ Build completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 