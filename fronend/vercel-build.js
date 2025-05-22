const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

try {
  // Create necessary directories
  console.log('📁 Creating directories...');
  ['build', 'build/static', 'build/static/css', 'src/styles'].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install --production=false', { stdio: 'inherit' });

  // Generate CSS first
  console.log('🎨 Generating CSS...');
  execSync('npx tailwindcss -i ./src/index.css -o ./src/styles/tailwind.css --minify', { stdio: 'inherit' });
  
  // Ensure the CSS file exists
  if (!fs.existsSync('./src/styles/tailwind.css')) {
    throw new Error('CSS file was not generated properly');
  }

  // Build the application
  console.log('🏗️ Building application...');
  execSync('cross-env NODE_ENV=production CI=false npm run build', { stdio: 'inherit' });

  // Verify build output
  if (!fs.existsSync('./build')) {
    throw new Error('Build directory was not created');
  }

  // Verify CSS files exist in build
  console.log('✅ Verifying CSS files...');
  execSync('ls -la build/static/css', { stdio: 'inherit' });

  // Install backend dependencies
  console.log('📦 Installing backend dependencies...');
  execSync('cd backend && npm install --force', { stdio: 'inherit' });

  console.log('✅ Build completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}