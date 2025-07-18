// clean-build.js - ES Module version for compatibility with type:module
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the dist directory
const distPath = path.join(__dirname, 'dist');

console.log('Checking if dist directory exists...');
if (fs.existsSync(distPath)) {
  console.log('Removing existing dist directory...');
  try {
    // Use fs.rmSync for Node.js 14+ (cross-platform)
    fs.rmSync(distPath, { recursive: true, force: true });
    console.log('Successfully removed dist directory');
  } catch (err) {
    console.error('Error removing dist directory:', err);
    process.exit(1);
  }
} else {
  console.log('No existing dist directory found');
}

console.log('Running build command...');
try {
  execSync('tsc && vite build', { stdio: 'inherit' });
  console.log('Build completed successfully');
} catch (err) {
  console.error('Build failed:', err);
  process.exit(1);
}