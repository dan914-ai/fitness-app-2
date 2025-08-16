#!/usr/bin/env node

/**
 * Korean Fitness App Setup Script
 * 
 * This script helps set up the development environment
 * and performs initial checks for the Korean Fitness mobile app.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🏋️ Korean Fitness App Setup');
console.log('================================\n');

// Check Node.js version
function checkNodeVersion() {
  const requiredVersion = 18;
  const currentVersion = parseInt(process.version.slice(1).split('.')[0]);
  
  if (currentVersion < requiredVersion) {
    console.error(`❌ Node.js ${requiredVersion}+ is required. Current version: ${process.version}`);
    process.exit(1);
  }
  
  console.log(`✅ Node.js version: ${process.version}`);
}

// Check if required files exist
function checkRequiredFiles() {
  const files = [
    'package.json',
    'app.json',
    'src/navigation/AppNavigator.tsx',
    'src/constants/api.ts',
    'src/constants/colors.ts'
  ];
  
  const missingFiles = files.filter(file => !fs.existsSync(file));
  
  if (missingFiles.length > 0) {
    console.error(`❌ Missing required files: ${missingFiles.join(', ')}`);
    process.exit(1);
  }
  
  console.log('✅ All required files present');
}

// Check Expo CLI
function checkExpoCLI() {
  try {
    execSync('expo --version', { stdio: 'pipe' });
    console.log('✅ Expo CLI is installed');
  } catch (error) {
    console.warn('⚠️  Expo CLI not found. Installing...');
    try {
      execSync('npm install -g @expo/cli', { stdio: 'inherit' });
      console.log('✅ Expo CLI installed successfully');
    } catch (installError) {
      console.error('❌ Failed to install Expo CLI. Please install manually: npm install -g @expo/cli');
    }
  }
}

// Install dependencies
function installDependencies() {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully');
  } catch (error) {
    console.error('❌ Failed to install dependencies');
    process.exit(1);
  }
}

// Create .env.example if it doesn't exist
function createEnvExample() {
  const envExamplePath = '.env.example';
  const envExample = `# Korean Fitness App Environment Variables

# API Configuration
API_BASE_URL=http://localhost:3000/api

# Expo Configuration
EXPO_PROJECT_ID=your-expo-project-id

# Push Notifications
EXPO_PUSH_TOKEN=your-expo-push-token

# Development
NODE_ENV=development
`;

  if (!fs.existsSync(envExamplePath)) {
    fs.writeFileSync(envExamplePath, envExample);
    console.log('✅ Created .env.example file');
  } else {
    console.log('✅ .env.example file already exists');
  }
}

// Validate package.json
function validatePackageJson() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const requiredDeps = [
    '@react-navigation/native',
    '@react-navigation/bottom-tabs',
    '@react-navigation/stack',
    'expo',
    'react',
    'react-native',
    'typescript'
  ];
  
  const missingDeps = requiredDeps.filter(dep => 
    !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
  );
  
  if (missingDeps.length > 0) {
    console.warn(`⚠️  Missing dependencies: ${missingDeps.join(', ')}`);
  } else {
    console.log('✅ All required dependencies present');
  }
}

// Display next steps
function displayNextSteps() {
  console.log('\n🎉 Setup completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Copy .env.example to .env and configure your API endpoints');
  console.log('2. Make sure your backend server is running');
  console.log('3. Start the development server: npm start');
  console.log('4. Test on device: npm run ios / npm run android');
  console.log('\n📚 Documentation:');
  console.log('- README.md - Complete setup and usage guide');
  console.log('- src/navigation/types.ts - Navigation type definitions');
  console.log('- src/constants/ - App configuration');
  console.log('\n🏋️ Happy coding!');
}

// Main setup function
async function setup() {
  try {
    checkNodeVersion();
    checkRequiredFiles();
    checkExpoCLI();
    installDependencies();
    createEnvExample();
    validatePackageJson();
    displayNextSteps();
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
setup();