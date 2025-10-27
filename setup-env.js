const fs = require('fs');
const path = require('path');

// Create .env file from env.example if it doesn't exist
const envExamplePath = path.join(__dirname, 'env.example');
const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  console.log('📝 Creating .env file from env.example...');
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ .env file created successfully!');
  console.log('⚠️  Please update the .env file with your actual configuration values.');
} else if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists.');
} else {
  console.log('❌ env.example file not found. Please create it first.');
}
