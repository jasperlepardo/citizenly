#!/usr/bin/env node

/**
 * Debug Documentation Checker
 * Analyzes why certain files show 0% coverage despite having JSDoc
 */

const fs = require('fs');

/**
 * Extract JSDoc comments from code
 */
function extractJSDocComments(code) {
  const jsdocPattern = /\/\*\*([\s\S]*?)\*\//g;
  const comments = [];
  let match;
  
  while ((match = jsdocPattern.exec(code)) !== null) {
    // Calculate line number at the END of the JSDoc comment, not the start
    const endIndex = match.index + match[0].length;
    const lines = code.substring(0, endIndex).split('\n');
    const lineNumber = lines.length;
    
    comments.push({
      line: lineNumber,
      content: match[1],
      raw: match[0]
    });
  }
  
  return comments;
}

/**
 * Extract documentable items
 */
function extractDocumentableItems(code, filePath) {
  const lines = code.split('\n');
  const items = [];
  
  const patterns = [
    {
      type: 'export_function',
      pattern: /^export\s+(?:default\s+)?(?:async\s+)?function\s+(\w+)/,
      required: true
    },
    {
      type: 'export_const_function',
      pattern: /^export\s+const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/,
      required: true
    },
    {
      type: 'export_component',
      pattern: /^export\s+(?:default\s+)?function\s+(\w+).*\{/,
      required: true,
      isComponent: true
    },
    {
      type: 'react_component',
      pattern: /^(?:export\s+(?:default\s+)?)?function\s+([A-Z]\w+).*\{/,
      required: true,
      isComponent: true
    }
  ];
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const lineNumber = index + 1;
    
    patterns.forEach(({ type, pattern, required, isComponent }) => {
      const match = trimmed.match(pattern);
      if (match) {
        const name = match[1];
        
        // Check if it's actually a React component
        const actuallyComponent = isComponent || (
          type.includes('function') && 
          /^[A-Z]/.test(name) && 
          (trimmed.includes('return') || code.includes(`return <`) || code.includes(`jsx`))
        );
        
        items.push({
          type: actuallyComponent ? 'react_component' : type,
          name,
          line: lineNumber,
          required,
          isPublic: trimmed.startsWith('export'),
          isComponent: actuallyComponent
        });
      }
    });
  });
  
  return items;
}

/**
 * Debug a specific file
 */
function debugFile(filePath) {
  console.log(`\n🔍 Debugging: ${filePath}`);
  console.log('=' .repeat(60));
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const comments = extractJSDocComments(content);
    const items = extractDocumentableItems(content, filePath);
    
    console.log(`📝 Found ${comments.length} JSDoc comments:`);
    comments.forEach((comment, index) => {
      console.log(`   ${index + 1}. Line ${comment.line}: ${comment.raw.split('\n')[0]}...`);
    });
    
    console.log(`\n🎯 Found ${items.length} documentable items:`);
    items.forEach((item, index) => {
      console.log(`   ${index + 1}. Line ${item.line}: ${item.type} '${item.name}' (${item.required ? 'required' : 'optional'})`);
      
      // Check if this item has documentation
      const precedingComment = comments.find(comment => 
        comment.line >= item.line - 5 && comment.line <= item.line - 1
      );
      
      if (precedingComment) {
        console.log(`      ✅ Has JSDoc at line ${precedingComment.line}`);
      } else {
        console.log(`      ❌ Missing JSDoc (required: ${item.required})`);
      }
    });
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🐛 Documentation Checker Debug Tool');
  console.log('🎯 Analyzing files showing 0% coverage...\n');
  
  // Debug specific problematic files
  const problemFiles = [
    'src/app/api/addresses/barangays/public/route.ts',
    'src/app/admin/create-user/page.tsx',
    'src/app/admin/users/page.tsx'
  ];
  
  problemFiles.forEach(file => {
    debugFile(file);
  });
}

if (require.main === module) {
  main();
}

module.exports = { debugFile, extractJSDocComments, extractDocumentableItems };