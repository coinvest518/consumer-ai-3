// Simple pre-build script to clean the dist directory
import fs from 'fs';
import path from 'path';
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
    fs.rmSync(distPath, { recursive: true, force: true });
    console.log('Successfully removed dist directory');
  } catch (err) {
    console.error('Error removing dist directory:', err);
    // Don't exit with error, just continue
    console.log('Continuing with build...');
  }
} else {
  console.log('No existing dist directory found');
}