#!/usr/bin/env node

/**
 * Quick Documentation Generator
 * Automatically adds basic JSDoc comments to undocumented functions
 */

const fs = require('fs');
const path = require('path');

/**
 * Generate basic JSDoc for a function
 */
function generateJSDocForFunction(functionName, functionLine, isComponent = false, isAPI = false) {
  if (isComponent) {
    const componentDescription = functionName.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
    return `/**
 * ${functionName} Component
 * 
 * @description Renders the ${componentDescription} interface
 * @returns {JSX.Element} The rendered component
 */`;
  }
  
  if (isAPI) {
    const method = functionName.toUpperCase();
    const methodDescriptions = {
      'GET': 'Retrieves data from',
      'POST': 'Creates new data in',
      'PUT': 'Updates existing data in',
      'DELETE': 'Removes data from',
      'PATCH': 'Partially updates data in'
    };
    const description = methodDescriptions[method] || 'Handles requests for';
    
    return `/**
 * ${method} API Handler
 * 
 * @description ${description} this endpoint
 * @param {NextRequest} request - The incoming request object
 * @returns {Promise<NextResponse>} The API response
 */`;
  }
  
  const description = functionName.replace(/([A-Z])/g, ' $1').trim();
  return `/**
 * ${description}
 * 
 * @description ${description} function
 * @returns {unknown} Function result
 */`;
}

/**
 * Add documentation to a file
 */
function addDocumentationToFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const newLines = [];
    let i = 0;
    let addedDocs = 0;
    
    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Check if this line starts a function that needs documentation
      const patterns = [
        { pattern: /^export\s+(?:default\s+)?(?:async\s+)?function\s+(\w+)/, type: 'function' },
        { pattern: /^export\s+const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/, type: 'function' },
        { pattern: /^export\s+(?:default\s+)?function\s+([A-Z]\w+).*\{/, type: 'component' },
        { pattern: /^export\s+(?:async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)/, type: 'api' }
      ];
      
      let needsDoc = false;
      let functionName = '';
      let docType = 'function';
      
      for (const { pattern, type } of patterns) {
        const match = trimmed.match(pattern);
        if (match) {
          functionName = match[1];
          docType = type;
          
          // Check if there's already JSDoc above (within 3 lines)
          let hasDoc = false;
          for (let j = Math.max(0, i - 3); j < i; j++) {
            if (lines[j].trim().includes('/**') || lines[j].trim().includes('*')) {
              hasDoc = true;
              break;
            }
          }
          
          if (!hasDoc) {
            needsDoc = true;
          }
          break;
        }
      }
      
      if (needsDoc) {
        // Add JSDoc comment before the function
        const indent = line.match(/^(\s*)/)[1];
        const jsDoc = generateJSDocForFunction(
          functionName, 
          i + 1, 
          docType === 'component', 
          docType === 'api'
        );
        
        const jsDocLines = jsDoc.split('\n').map(docLine => indent + docLine);
        newLines.push(...jsDocLines);
        addedDocs++;
      }
      
      newLines.push(line);
      i++;
    }
    
    if (addedDocs > 0) {
      fs.writeFileSync(filePath, newLines.join('\n'));
      console.log(`   ✅ Added ${addedDocs} JSDoc comments to ${filePath}`);
      return addedDocs;
    }
    
    return 0;
  } catch (error) {
    console.warn(`   ⚠️  Could not process ${filePath}: ${error.message}`);
    return 0;
  }
}

/**
 * Get file processing limit based on priority
 */
function getFileLimit(priority) {
  switch (priority) {
    case 'high': return 50;
    case 'medium': return 30;
    case 'low': return 20;
    default: return 10;
  }
}

/**
 * Process files by priority
 */
function processFilesByPriority() {
  const priorities = [
    {
      name: 'API Routes',
      pattern: 'src/app/api/**/route.ts',
      priority: 'high'
    },
    {
      name: 'Page Components', 
      pattern: 'src/app/**/page.tsx',
      priority: 'high'
    },
    {
      name: 'Utility Libraries',
      pattern: 'src/lib/**/*.ts',
      priority: 'high'
    },
    {
      name: 'React Components',
      pattern: 'src/components/**/*.tsx',
      priority: 'medium'
    },
    {
      name: 'Hooks',
      pattern: 'src/hooks/**/*.ts',
      priority: 'medium'
    },
    {
      name: 'Context Providers',
      pattern: 'src/contexts/**/*.tsx',
      priority: 'medium'
    },
    {
      name: 'Additional TypeScript Files',
      pattern: 'src/**/*.ts',
      priority: 'low'
    }
  ];
  
  let totalAdded = 0;
  
  priorities.forEach(({ name, pattern, priority }) => {
    console.log(`\n📁 Processing ${name} (${priority} priority)...`);
    
    const { execSync } = require('child_process');
    try {
      const files = execSync(`find . -path "./${pattern}" -type f`, { encoding: 'utf8' })
        .split('\n')
        .filter(f => f.length > 0)
        .slice(0, getFileLimit(priority)); // Scaled limits by priority
      
      files.forEach(file => {
        const added = addDocumentationToFile(file);
        totalAdded += added;
      });
      
      console.log(`   📊 Processed ${files.length} files in ${name}`);
    } catch (error) {
      console.warn(`   ⚠️  Could not find files for pattern: ${pattern}`);
    }
  });
  
  return totalAdded;
}

/**
 * Main execution
 */
function main() {
  console.log('📚 Quick Documentation Generator');
  console.log('🎯 Adding basic JSDoc comments to undocumented functions...\n');
  
  const startTime = Date.now();
  const totalAdded = processFilesByPriority();
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log(`\n🎉 Documentation Enhancement Complete!`);
  console.log(`   📝 Added ${totalAdded} JSDoc comments`);
  console.log(`   ⏱️  Completed in ${duration} seconds`);
  
  if (totalAdded > 0) {
    console.log('\n💡 Next steps:');
    console.log('   1. Review and enhance the generated documentation');
    console.log('   2. Add @param and @returns tags where needed');
    console.log('   3. Run npm run quality:docs to check coverage');
    console.log('   4. Commit the documentation improvements');
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  addDocumentationToFile,
  generateJSDocForFunction
};