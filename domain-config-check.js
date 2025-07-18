// Domain Configuration Check Script
// Run with: node domain-config-check.js

console.log('ConsumerAI Domain Configuration Check');
console.log('====================================');

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Check domain configuration
const domain = 'consumerai.info';
console.log(`\nChecking configuration for domain: ${domain}`);

// Check environment variables
console.log('\nEnvironment Variables:');
const requiredVars = [
  { name: 'VITE_PUBLIC_URL', expected: `https://${domain}` },
  { name: 'VITE_API_BASE_URL', expected: `https://${domain}/api` },
  { name: 'STRIPE_SUCCESS_URL', expected: `https://${domain}/thank-you` },
  { name: 'STRIPE_CANCEL_URL', expected: `https://${domain}/pricing` }
];

let allCorrect = true;
requiredVars.forEach(variable => {
  const value = process.env[variable.name];
  const isCorrect = value === variable.expected;
  console.log(`- ${variable.name}: ${value || 'NOT SET'} ${isCorrect ? '✓' : '✗'}`);
  if (!isCorrect) {
    console.log(`  Expected: ${variable.expected}`);
    allCorrect = false;
  }
});

// Check config.ts
console.log('\nChecking src/lib/config.ts:');
import fs from 'fs';
import path from 'path';
const configPath = path.join(__dirname, 'src', 'lib', 'config.ts');

try {
  const configContent = fs.readFileSync(configPath, 'utf8');
  const productionApiUrlMatch = configContent.match(/PRODUCTION_API_URL\s*=\s*['"]([^'"]+)['"]/);
  
  if (productionApiUrlMatch) {
    const productionApiUrl = productionApiUrlMatch[1];
    const isCorrect = productionApiUrl === `https://${domain}/api`;
    console.log(`- PRODUCTION_API_URL: ${productionApiUrl} ${isCorrect ? '✓' : '✗'}`);
    if (!isCorrect) {
      console.log(`  Expected: https://${domain}/api`);
      allCorrect = false;
    }
  } else {
    console.log('- PRODUCTION_API_URL: Not found in config.ts ✗');
    allCorrect = false;
  }
} catch (error) {
  console.error('Error reading config.ts:', error.message);
  allCorrect = false;
}

// Check vercel.json
console.log('\nChecking vercel.json:');
const vercelPath = path.join(__dirname, 'vercel.json');

try {
  const vercelContent = fs.readFileSync(vercelPath, 'utf8');
  const vercelConfig = JSON.parse(vercelContent);
  
  // Check API routes
  const hasApiRoutes = vercelConfig.rewrites && 
    vercelConfig.rewrites.some(route => route.source === '/api' || route.source === '/api/(.*)');
  
  console.log(`- API routes configured: ${hasApiRoutes ? '✓' : '✗'}`);
  if (!hasApiRoutes) {
    allCorrect = false;
  }
  
  // Check CORS headers
  const hasCorsHeaders = vercelConfig.headers && 
    vercelConfig.headers.some(header => header.source === '/api/(.*)');
  
  console.log(`- CORS headers configured: ${hasCorsHeaders ? '✓' : '✗'}`);
  if (!hasCorsHeaders) {
    allCorrect = false;
  }
} catch (error) {
  console.error('Error reading vercel.json:', error.message);
  allCorrect = false;
}

// Summary
console.log('\nSummary:');
if (allCorrect) {
  console.log('✅ All domain configurations are correct!');
  console.log('Your application is ready to be deployed to Vercel with the domain:', domain);
} else {
  console.log('❌ Some domain configurations need to be fixed.');
  console.log('Please update the configurations before deploying.');
}

console.log('\nNext steps:');
console.log('1. Push your code to GitHub');
console.log('2. Connect your GitHub repository to Vercel');
console.log('3. Set up the environment variables in Vercel');
console.log('4. Deploy your application');
console.log('5. Configure your custom domain in Vercel');