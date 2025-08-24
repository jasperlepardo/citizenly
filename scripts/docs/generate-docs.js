#!/usr/bin/env node

/**
 * API Documentation Generator
 * Generates markdown documentation from JSDoc comments
 */

const fs = require('fs');
const path = require('path');

class DocumentationGenerator {
  constructor() {
    this.apiDocs = {};
    this.components = {};
    this.hooks = {};
  }

  parseJSDoc(comment, functionName) {
    const lines = comment.split('\n').map(line => line.replace(/^\s*\*\s?/, ''));
    
    let description = '';
    const params = [];
    const returns = { type: '', description: '' };
    const examples = [];
    
    let currentSection = 'description';
    
    for (const line of lines) {
      if (line.startsWith('@param')) {
        currentSection = 'params';
        const match = line.match(/@param\s+\{([^}]+)\}\s+(\w+)\s+-?\s*(.*)/);
        if (match) {
          params.push({
            name: match[2],
            type: match[1],
            description: match[3] || ''
          });
        }
      } else if (line.startsWith('@returns') || line.startsWith('@return')) {
        currentSection = 'returns';
        const match = line.match(/@returns?\s+\{([^}]+)\}\s*(.*)/);
        if (match) {
          returns.type = match[1];
          returns.description = match[2] || '';
        }
      } else if (line.startsWith('@example')) {
        currentSection = 'examples';
      } else if (currentSection === 'description' && line.trim()) {
        description += (description ? ' ' : '') + line.trim();
      } else if (currentSection === 'examples' && line.trim()) {
        examples.push(line);
      }
    }
    
    return { description, params, returns, examples };
  }

  processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Match JSDoc + function pairs
    const docFunctionRegex = /\/\*\*([\s\S]*?)\*\/\s*(?:export\s+)?(?:async\s+)?(?:function\s+(\w+)|const\s+(\w+)\s*=)/g;
    
    let match;
    while ((match = docFunctionRegex.exec(content)) !== null) {
      const jsdoc = match[1];
      const functionName = match[2] || match[3];
      
      if (functionName) {
        const parsed = this.parseJSDoc(jsdoc, functionName);
        
        const docEntry = {
          name: functionName,
          file: relativePath,
          ...parsed
        };
        
        // Categorize by file type/location
        if (relativePath.includes('/hooks/')) {
          this.hooks[functionName] = docEntry;
        } else if (relativePath.includes('/components/')) {
          this.components[functionName] = docEntry;
        } else if (relativePath.includes('/api/') || relativePath.includes('/services/')) {
          this.apiDocs[functionName] = docEntry;
        }
      }
    }
  }

  processDirectory(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = path.join(dir, file.name);
      
      if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
        this.processDirectory(filePath);
      } else if (file.name.match(/\.(ts|tsx|js|jsx)$/) && !file.name.includes('.test.')) {
        this.processFile(filePath);
      }
    }
  }

  generateMarkdown(category, items, title) {
    if (Object.keys(items).length === 0) return '';
    
    let md = `## ${title}\n\n`;
    
    Object.values(items).forEach(item => {
      md += `### \`${item.name}\`\n\n`;
      md += `**File:** \`${item.file}\`\n\n`;
      
      if (item.description) {
        md += `${item.description}\n\n`;
      }
      
      if (item.params.length > 0) {
        md += `**Parameters:**\n\n`;
        item.params.forEach(param => {
          md += `- \`${param.name}\` (\`${param.type}\`) - ${param.description}\n`;
        });
        md += '\n';
      }
      
      if (item.returns.type) {
        md += `**Returns:** \`${item.returns.type}\``;
        if (item.returns.description) {
          md += ` - ${item.returns.description}`;
        }
        md += '\n\n';
      }
      
      if (item.examples.length > 0) {
        md += `**Example:**\n\n\`\`\`typescript\n${item.examples.join('\n')}\n\`\`\`\n\n`;
      }
      
      md += '---\n\n';
    });
    
    return md;
  }

  generateDocumentation() {
    const docsDir = path.join(process.cwd(), 'docs/api-reference');
    
    // Ensure docs directory exists
    fs.mkdirSync(docsDir, { recursive: true });
    
    let fullDoc = '# API Documentation\n\n';
    fullDoc += `Generated on: ${new Date().toISOString()}\n\n`;
    
    const hooksDocs = this.generateMarkdown('hooks', this.hooks, 'React Hooks');
    const componentsDocs = this.generateMarkdown('components', this.components, 'Components');
    const apiDocs = this.generateMarkdown('api', this.apiDocs, 'API Functions');
    
    if (hooksDocs) {
      fullDoc += hooksDocs;
      fs.writeFileSync(path.join(docsDir, 'hooks.md'), `# React Hooks\n\n${hooksDocs}`);
    }
    
    if (componentsDocs) {
      fullDoc += componentsDocs;
      fs.writeFileSync(path.join(docsDir, 'components.md'), `# Components\n\n${componentsDocs}`);
    }
    
    if (apiDocs) {
      fullDoc += apiDocs;
      fs.writeFileSync(path.join(docsDir, 'api.md'), `# API Functions\n\n${apiDocs}`);
    }
    
    // Write combined documentation
    fs.writeFileSync(path.join(docsDir, 'README.md'), fullDoc);
    
    console.log('📖 Documentation generated:');
    console.log(`  - Hooks: ${Object.keys(this.hooks).length} documented`);
    console.log(`  - Components: ${Object.keys(this.components).length} documented`);
    console.log(`  - API Functions: ${Object.keys(this.apiDocs).length} documented`);
    console.log(`  - Output: ${docsDir}`);
  }
}

// CLI usage
if (require.main === module) {
  const srcDir = path.join(process.cwd(), 'src');
  const generator = new DocumentationGenerator();
  
  console.log('Generating API documentation...');
  generator.processDirectory(srcDir);
  generator.generateDocumentation();
}

module.exports = { DocumentationGenerator };