#!/usr/bin/env node

/**
 * Folder Structure Cleanup Script
 * Organizes root directory files according to coding standards
 */

const fs = require('fs');
const path = require('path');

/**
 * File categorization rules
 */
const FILE_CATEGORIES = {
  // Database related files
  database: {
    patterns: [/\.sql$/, /database/, /migration/, /schema/, /psgc/, /psoc/],
    destination: 'database/migrations/archived',
    description: 'SQL files and database scripts'
  },
  
  // Test and debug scripts
  testing: {
    patterns: [/^test-/, /^debug-/, /^check-/, /^verify-/, /^simple-/, /^basic-/],
    destination: 'scripts/testing',
    description: 'Test and debug scripts'
  },
  
  // Setup and configuration scripts
  setup: {
    patterns: [/^setup-/, /^apply-/, /^fix-/, /^create-/, /^import-/, /^cleanup-/],
    destination: 'scripts/setup',
    description: 'Setup and configuration scripts'
  },
  
  // Temporary/working files
  temporary: {
    patterns: [/^step[0-9]/, /^manual-/, /^dev-/, /^run-/, /temp/, /tmp/],
    destination: 'scripts/temp',
    description: 'Temporary working files'
  },
  
  // Documentation
  documentation: {
    patterns: [/\.md$/, /DEPLOYMENT/, /PRODUCTION/, /GUIDE/],
    destination: 'docs/operations',
    description: 'Documentation files'
  },
  
  // Reports and analysis
  reports: {
    patterns: [/-report\.json$/, /-analysis/, /coverage/, /security-/, /bundle-/, /complexity-/],
    destination: 'reports',
    description: 'Generated reports and analysis files'
  }
};

/**
 * Files that should stay in root
 */
const KEEP_IN_ROOT = [
  // Project configuration
  'package.json', 'package-lock.json', 'tsconfig.json', 'next.config.js',
  'tailwind.config.js', 'postcss.config.js', 'jest.config.js', 'vitest.config.ts',
  
  // Environment and build
  '.env.example', '.gitignore', 'README.md', 'CLAUDE.md',
  'netlify.toml', 'vercel.json', 'sonar-project.properties',
  
  // Generated reports (recent)
  'folder-structure-report.json', 'audit-ci.json',
  
  // Directories that should stay
  'src', 'public', 'docs', 'database', 'scripts', 'coverage', 
  '.github', '.next', 'node_modules', 'storybook-static',
  '.git', '.vscode', '.gitignore', '.husky', '.githooks', '.storybook'
];

/**
 * Analyze current root directory
 */
function analyzeRootDirectory() {
  console.log('📊 Analyzing root directory...');
  
  const items = fs.readdirSync('.');
  const analysis = {
    total: 0,
    directories: 0,
    files: 0,
    categorized: {},
    uncategorized: [],
    keepInRoot: []
  };
  
  // Initialize category counters
  Object.keys(FILE_CATEGORIES).forEach(cat => {
    analysis.categorized[cat] = [];
  });
  
  for (const item of items) {
    const stat = fs.statSync(item);
    analysis.total++;
    
    if (stat.isDirectory()) {
      analysis.directories++;
      if (KEEP_IN_ROOT.includes(item)) {
        analysis.keepInRoot.push(item);
      }
    } else {
      analysis.files++;
      
      if (KEEP_IN_ROOT.includes(item)) {
        analysis.keepInRoot.push(item);
      } else {
        // Categorize file
        let categorized = false;
        
        for (const [category, config] of Object.entries(FILE_CATEGORIES)) {
          if (config.patterns.some(pattern => pattern.test(item))) {
            analysis.categorized[category].push(item);
            categorized = true;
            break;
          }
        }
        
        if (!categorized) {
          analysis.uncategorized.push(item);
        }
      }
    }
  }
  
  return analysis;
}

/**
 * Create destination directories
 */
function createDestinationDirectories() {
  const directories = new Set();
  
  Object.values(FILE_CATEGORIES).forEach(config => {
    directories.add(config.destination);
  });
  
  for (const dir of directories) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`   ✅ Created directory: ${dir}`);
    }
  }
}

/**
 * Move files to appropriate locations
 */
function moveFiles(analysis, dryRun = false) {
  let movedCount = 0;
  const operations = [];
  
  for (const [category, files] of Object.entries(analysis.categorized)) {
    if (files.length === 0) continue;
    
    const destination = FILE_CATEGORIES[category].destination;
    
    for (const file of files) {
      const sourcePath = file;
      const destPath = path.join(destination, file);
      
      operations.push({
        type: 'move',
        source: sourcePath,
        destination: destPath,
        category: category
      });
      
      if (!dryRun) {
        try {
          fs.renameSync(sourcePath, destPath);
          movedCount++;
        } catch (error) {
          console.error(`   ❌ Failed to move ${sourcePath}: ${error.message}`);
        }
      }
    }
  }
  
  return { movedCount, operations };
}

/**
 * Generate cleanup summary
 */
function generateCleanupSummary(analysis, operations) {
  const summary = {
    timestamp: new Date().toISOString(),
    analysis,
    operations: operations.length,
    breakdown: {}
  };
  
  // Count operations by category
  for (const op of operations) {
    if (!summary.breakdown[op.category]) {
      summary.breakdown[op.category] = 0;
    }
    summary.breakdown[op.category]++;
  }
  
  return summary;
}

/**
 * Create .gitkeep files for empty directories
 */
function createGitkeepFiles() {
  const dirs = [
    'scripts/testing',
    'scripts/setup', 
    'scripts/temp',
    'docs/operations',
    'reports'
  ];
  
  for (const dir of dirs) {
    const gitkeepPath = path.join(dir, '.gitkeep');
    if (!fs.existsSync(gitkeepPath)) {
      fs.writeFileSync(gitkeepPath, '# Keep this directory in git\n');
    }
  }
}

/**
 * Main cleanup function
 */
function cleanupFolderStructure(dryRun = false) {
  console.log('🧹 Folder Structure Cleanup');
  console.log(`🎯 ${dryRun ? 'Simulating' : 'Executing'} folder organization...\n`);
  
  const startTime = Date.now();
  
  try {
    // 1. Analyze current state
    console.log('📋 Task 1: Analyzing current folder structure...');
    const analysis = analyzeRootDirectory();
    console.log(`   📊 Found ${analysis.total} items (${analysis.files} files, ${analysis.directories} directories)`);
    console.log(`   📁 ${analysis.keepInRoot.length} items will stay in root`);
    
    // Show categorization breakdown
    Object.entries(analysis.categorized).forEach(([category, files]) => {
      if (files.length > 0) {
        console.log(`   📦 ${category}: ${files.length} files`);
      }
    });
    
    if (analysis.uncategorized.length > 0) {
      console.log(`   ❓ Uncategorized: ${analysis.uncategorized.length} files`);
    }
    
    // 2. Create destination directories
    if (!dryRun) {
      console.log('\n📋 Task 2: Creating destination directories...');
      createDestinationDirectories();
    }
    
    // 3. Move files
    console.log(`\n📋 Task 3: ${dryRun ? 'Simulating file moves' : 'Moving files'}...`);
    const moveResult = moveFiles(analysis, dryRun);
    
    if (dryRun) {
      console.log(`   📊 Would move ${moveResult.operations.length} files`);
    } else {
      console.log(`   ✅ Moved ${moveResult.movedCount} files`);
    }
    
    // 4. Create .gitkeep files
    if (!dryRun) {
      console.log('\n📋 Task 4: Creating .gitkeep files...');
      createGitkeepFiles();
      console.log('   ✅ Created .gitkeep files for new directories');
    }
    
    // 5. Generate summary
    const summary = generateCleanupSummary(analysis, moveResult.operations);
    const reportFile = `folder-cleanup-${dryRun ? 'simulation' : 'report'}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(summary, null, 2));
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log(`\n🧹 Folder Cleanup ${dryRun ? 'Simulation' : 'Complete'}!`);
    console.log(`   📊 Operations planned: ${moveResult.operations.length}`);
    console.log(`   🎯 Files ${dryRun ? 'to move' : 'moved'}: ${dryRun ? moveResult.operations.length : moveResult.movedCount}`);
    console.log(`   ⏱️  Completed in ${duration} seconds`);
    
    // Show what will happen or what happened
    if (moveResult.operations.length > 0) {
      console.log(`\n📋 ${dryRun ? 'Planned Operations' : 'Completed Operations'}:`);
      
      Object.entries(FILE_CATEGORIES).forEach(([category, config]) => {
        const categoryOps = moveResult.operations.filter(op => op.category === category);
        if (categoryOps.length > 0) {
          console.log(`   📦 ${config.description}: ${categoryOps.length} files → ${config.destination}`);
        }
      });
    }
    
    // Show uncategorized files that need manual attention
    if (analysis.uncategorized.length > 0) {
      console.log('\n❓ Files needing manual review:');
      analysis.uncategorized.slice(0, 10).forEach(file => {
        console.log(`   📄 ${file}`);
      });
      if (analysis.uncategorized.length > 10) {
        console.log(`   ... and ${analysis.uncategorized.length - 10} more files`);
      }
    }
    
    console.log(`\n📋 ${dryRun ? 'Simulation' : 'Cleanup'} report saved to: ${reportFile}`);
    
    if (dryRun) {
      console.log('\n💡 To execute the cleanup, run: node scripts/folder-cleanup.js --execute');
    }
    
    return summary;
    
  } catch (error) {
    console.error('❌ Error during folder cleanup:', error.message);
    process.exit(1);
  }
}

// Command line interface
if (require.main === module) {
  const dryRun = !process.argv.includes('--execute');
  cleanupFolderStructure(dryRun);
}

module.exports = {
  cleanupFolderStructure,
  analyzeRootDirectory,
  FILE_CATEGORIES
};