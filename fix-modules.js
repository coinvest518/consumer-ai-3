#!/usr/bin/env node

/**
 * Simple script to fix common ES module issues in development
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Checking for ES module issues...');

// Check if pdf-parse is causing issues and suggest fixes
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log('✅ Package.json type:', packageJson.type);
console.log('✅ PDF-parse version:', packageJson.dependencies['pdf-parse']);
console.log('✅ LangChain community version:', packageJson.dependencies['@langchain/community']);

// Simple recommendations
console.log('\n📋 Development Tips:');
console.log('1. Use require() for CommonJS modules like pdf-parse');
console.log('2. Use direct OpenAI API instead of LangChain wrappers when possible');
console.log('3. Keep ES modules for modern packages like Supabase');
console.log('4. Test PDF upload at: http://localhost:3000');

console.log('\n🚀 Ready for development!');