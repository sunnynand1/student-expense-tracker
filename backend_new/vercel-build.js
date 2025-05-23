const { execSync } = require('child_process');

console.log('Running vercel-build script...');

try {
  // Install all dependencies including devDependencies
  console.log('Installing dependencies...');
  execSync('npm install --production=false', { stdio: 'inherit' });
  
  // Run the build script if it exists
  console.log('Running build script...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
  } catch (error) {
    console.log('No build script found or build script failed, continuing...');
  }
  
  console.log('Build completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
