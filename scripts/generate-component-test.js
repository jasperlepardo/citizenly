#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function generateComponentTest(componentName) {
  const testDir = path.join('src', 'components', 'organisms', componentName, '__tests__');
  
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  const testPath = path.join(testDir, componentName + '.test.tsx');
  
  if (fs.existsSync(testPath)) {
    console.log('Test already exists for ' + componentName);
    return false;
  }
  
  const template = fs.readFileSync('scripts/test-templates/component.test.template.tsx', 'utf8');
  const testContent = template.replace(/ComponentName/g, componentName);
  
  fs.writeFileSync(testPath, testContent);
  console.log('✅ Generated test for ' + componentName);
  return true;
}

console.log('🧪 Test Generator Ready');
console.log('Usage: generateComponentTest("YourComponentName")');

module.exports = { generateComponentTest };
