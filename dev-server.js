#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Citizenly Development Server with Enhanced Live Reload...\n');

// Kill any existing processes on port 3000
const killExisting = spawn('pkill', ['-f', 'next dev'], { stdio: 'ignore' });

killExisting.on('close', () => {
  // Start Next.js with Turbo and enhanced options
  const nextDev = spawn('npx', [
    'next', 
    'dev', 
    '--turbo',
    '--port', '3000',
    '--hostname', '0.0.0.0'
  ], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping development server...');
    nextDev.kill('SIGTERM');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    nextDev.kill('SIGTERM');
    process.exit(0);
  });

  nextDev.on('close', (code) => {
    if (code !== 0) {
      console.log(`❌ Development server exited with code ${code}`);
    } else {
      console.log('✅ Development server stopped cleanly');
    }
    process.exit(code);
  });

  // Success message
  setTimeout(() => {
    console.log('\n🎉 Development server is ready!');
    console.log('📱 Local:    http://localhost:3000');
    console.log('🌐 Network:  http://0.0.0.0:3000');
    console.log('\n🔄 Features enabled:');
    console.log('  • Turbo Mode (faster builds)');
    console.log('  • Hot Module Replacement');
    console.log('  • Fast Refresh');
    console.log('  • Tailwind JIT compilation');
    console.log('  • TypeScript watch mode');
    console.log('\n💡 Make changes to your files and see them instantly!');
  }, 3000);
});