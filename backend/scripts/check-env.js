#!/usr/bin/env node

/**
 * This script checks if the required environment variables are set up correctly.
 * Run it with: node scripts/check-env.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to .env file
const envPath = path.resolve(__dirname, '../.env');

// Check if .env file exists
if (!fs.existsSync(envPath)) {
  console.error('\x1b[31m%s\x1b[0m', '❌ Error: .env file not found!');
  console.log('\x1b[33m%s\x1b[0m', 'Please create a .env file in the backend directory.');
  console.log('You can copy the .env.example file and fill in your API keys:');
  console.log('\x1b[36m%s\x1b[0m', '  cp .env.example .env\n');
  process.exit(1);
}

// Load environment variables from .env file
const env = dotenv.config({ path: envPath }).parsed;

// Required environment variables
const requiredVars = [
  { name: 'OPENAI_API_KEY', message: 'Get your API key from https://platform.openai.com/api-keys' },
  { name: 'PORT', message: 'Usually 3000 for local development' }
];

// Check if required environment variables are set
let hasErrors = false;

console.log('\x1b[36m%s\x1b[0m', '🔍 Checking environment variables...\n');

requiredVars.forEach(({ name, message }) => {
  if (!env || !env[name]) {
    console.error('\x1b[31m%s\x1b[0m', `❌ Missing ${name}`);
    console.log('\x1b[33m%s\x1b[0m', `   ${message}`);
    hasErrors = true;
  } else {
    console.log('\x1b[32m%s\x1b[0m', `✅ ${name} is set`);
  }
});

console.log('');

if (hasErrors) {
  console.error('\x1b[31m%s\x1b[0m', '❌ Some required environment variables are missing.');
  console.log('\x1b[33m%s\x1b[0m', 'Please update your .env file with the required values and try again.\n');
  process.exit(1);
} else {
  console.log('\x1b[32m%s\x1b[0m', '✅ All required environment variables are set!');
  console.log('\x1b[36m%s\x1b[0m', 'You are ready to run the application.\n');
} 