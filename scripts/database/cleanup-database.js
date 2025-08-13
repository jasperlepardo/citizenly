#!/usr/bin/env node

/**
 * Database Folder Cleanup Script
 * Organizes database directory according to best practices
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Database organization structure
 */
const DB_STRUCTURE = {
  migrations: {
    active: 'Current and recent migrations',
    archived: 'Historical migrations and patches',
    debug: 'Debug and diagnostic scripts',
    backups: 'Database backup files',
    temp: 'Temporary working files'
  }
};

/**
 * File classification rules
 */
const CLASSIFICATION_RULES = {
  // Active migrations (keep in migrations/)
  active: {
    patterns: [
      /^add-.*\.sql$/, /^create-.*\.sql$/, /^setup-.*\.sql$/,
      /^implement-.*\.sql$/, /^deploy-.*\.sql$/,
      /^production-.*\.sql$/, /schema\.sql$/
    ],
    destination: 'database/migrations/'
  },
  
  // Debug files
  debug: {
    patterns: [
      /^debug-/, /^check-/, /^analyze-/, /^test-/,
      /^verify-/, /^diagnose-/, /^step[0-9]/
    ],
    destination: 'database/migrations/debug/'
  },
  
  // Archived migrations and fixes
  archived: {
    patterns: [
      /^fix-/, /^patch-/, /^repair-/, /^cleanup-/,
      /^remove-/, /^delete-/, /^reset-/, /^revert-/,
      /^import-/, /^load-/, /^populate-/, /^sync-/,
      /^backup-/, /^restore-/
    ],
    destination: 'database/migrations/archived/'
  },
  
  // Backup files
  backups: {
    patterns: [
      /backup-.*/, /^restore/, /\.json$/, /\.csv$/
    ],
    destination: 'database/migrations/backups/'
  },
  
  // Temporary files
  temp: {
    patterns: [
      /^temp-/, /^tmp-/, /^draft-/, /^sample-/,
      /^manual-/, /^simple-/, /^quick-/
    ],
    destination: 'database/migrations/temp/'
  }
};

/**
 * Analyze current database directory
 */
function analyzeDatabaseFiles() {
  console.log('📊 Analyzing database files for cleanup...');
  
  const analysis = {
    total: 0,
    classified: {},
    unclassified: [],
    criticalIssues: [],
    artifactFiles: []
  };
  
  // Initialize classification categories
  Object.keys(CLASSIFICATION_RULES).forEach(category => {
    analysis.classified[category] = [];
  });
  
  function scanMigrationsDirectory() {
    const migrationsPath = 'database/migrations';
    if (!fs.existsSync(migrationsPath)) return;
    
    const items = fs.readdirSync(migrationsPath);
    
    for (const item of items) {
      const itemPath = path.join(migrationsPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isFile()) {
        analysis.total++;
        
        // Check for build artifacts
        if (item.endsWith('.map') || item.endsWith('.d.ts')) {
          analysis.artifactFiles.push(item);
          continue;
        }
        
        // Classify file
        let classified = false;
        for (const [category, rules] of Object.entries(CLASSIFICATION_RULES)) {
          if (rules.patterns.some(pattern => pattern.test(item))) {
            analysis.classified[category].push(item);
            classified = true;
            break;
          }
        }
        
        if (!classified) {
          analysis.unclassified.push(item);
        }
      } else if (stat.isDirectory()) {
        // Check for problematic directories
        if (item === 'node_modules') {
          analysis.criticalIssues.push({
            type: 'wrong_location',
            item: item,
            message: 'node_modules should not be in migrations/',
            action: 'remove'
          });
        }
      }
    }
  }
  
  scanMigrationsDirectory();
  return analysis;
}

/**
 * Create organized directory structure
 */
function createOrganizedStructure() {
  console.log('📁 Creating organized directory structure...');
  
  const directories = [
    'database/migrations/archived',
    'database/migrations/debug', 
    'database/migrations/backups',
    'database/migrations/temp'
  ];
  
  for (const dir of directories) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`   ✅ Created: ${dir}`);
    }
  }
  
  // Create .gitkeep files
  for (const dir of directories) {
    const gitkeepPath = path.join(dir, '.gitkeep');
    if (!fs.existsSync(gitkeepPath)) {
      fs.writeFileSync(gitkeepPath, '# Keep this directory in git\n');
    }
  }
}

/**
 * Move files to organized locations
 */
function organizeFiles(analysis, dryRun = false) {
  console.log(`📦 ${dryRun ? 'Simulating' : 'Executing'} file organization...`);
  
  let moved = 0;
  const operations = [];
  
  // Move classified files
  for (const [category, files] of Object.entries(analysis.classified)) {
    if (files.length === 0) continue;
    
    const destination = CLASSIFICATION_RULES[category].destination;
    
    for (const file of files) {
      const sourcePath = path.join('database/migrations', file);
      const destPath = path.join(destination, file);
      
      // Skip if already in correct location
      if (sourcePath === destPath) continue;
      
      operations.push({
        type: 'move',
        source: sourcePath,
        destination: destPath,
        category: category
      });
      
      if (!dryRun && fs.existsSync(sourcePath)) {
        try {
          fs.renameSync(sourcePath, destPath);
          moved++;
        } catch (error) {
          console.error(`   ❌ Failed to move ${sourcePath}: ${error.message}`);
        }
      }
    }
  }
  
  return { moved, operations };
}

/**
 * Handle critical issues
 */
function handleCriticalIssues(analysis, dryRun = false) {
  console.log(`🚨 ${dryRun ? 'Simulating' : 'Handling'} critical issues...`);
  
  let handled = 0;
  
  for (const issue of analysis.criticalIssues) {
    if (issue.action === 'remove' && issue.item === 'node_modules') {
      const targetPath = 'database/migrations/node_modules';
      
      if (!dryRun && fs.existsSync(targetPath)) {
        try {
          fs.rmSync(targetPath, { recursive: true, force: true });
          console.log(`   ✅ Removed: ${targetPath}`);
          handled++;
        } catch (error) {
          console.error(`   ❌ Failed to remove ${targetPath}: ${error.message}`);
        }
      } else if (dryRun) {
        console.log(`   🔧 Would remove: ${targetPath}`);
        handled++;
      }
    }
  }
  
  return handled;
}

/**
 * Clean up build artifacts
 */
function cleanupArtifacts(analysis, dryRun = false) {
  console.log(`🧹 ${dryRun ? 'Simulating' : 'Cleaning'} build artifacts...`);
  
  let cleaned = 0;
  
  for (const artifact of analysis.artifactFiles) {
    const artifactPath = path.join('database/migrations', artifact);
    
    if (!dryRun && fs.existsSync(artifactPath)) {
      try {
        fs.unlinkSync(artifactPath);
        cleaned++;
      } catch (error) {
        console.error(`   ❌ Failed to remove ${artifactPath}: ${error.message}`);
      }
    } else if (dryRun) {
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`   ✅ ${dryRun ? 'Would clean' : 'Cleaned'} ${cleaned} build artifacts`);
  }
  
  return cleaned;
}

/**
 * Create README for organized structure
 */
function createOrganizationREADME() {
  const readmeContent = `# Database Migrations Organization

## Directory Structure

### \`database/migrations/\`
**Active migrations** - Current and recent database changes
- Schema updates
- Production deployments
- Active feature migrations

### \`database/migrations/archived/\`
**Historical migrations** - Completed and legacy changes
- Old fixes and patches
- Import scripts
- Cleanup operations
- Reset and revert scripts

### \`database/migrations/debug/\`
**Debug and diagnostic files** - Development and troubleshooting
- Debug scripts
- Analysis tools
- Verification scripts
- Diagnostic queries

### \`database/migrations/backups/\`
**Backup and restore files** - Data preservation
- Database backups
- JSON exports
- CSV data files
- Restore scripts

### \`database/migrations/temp/\`
**Temporary files** - Working and experimental
- Draft migrations
- Temporary scripts
- Manual operations
- Quick fixes

## Guidelines

1. **Keep active migrations minimal** - Only current/recent changes
2. **Archive completed work** - Move old fixes to archived/
3. **Separate concerns** - Debug files in debug/, backups in backups/
4. **Document changes** - Add comments and descriptions
5. **Clean regularly** - Remove obsolete temporary files

## Maintenance

Run \`npm run database:analyze\` to check organization
Run \`npm run database:cleanup\` to reorganize files
`;

  fs.writeFileSync('database/migrations/README.md', readmeContent);
}

/**
 * Main database cleanup function
 */
function cleanupDatabaseFolder(dryRun = false) {
  console.log('🗄️ Database Folder Cleanup');
  console.log(`🎯 ${dryRun ? 'Simulating' : 'Executing'} database organization...\n`);
  
  const startTime = Date.now();
  
  try {
    // 1. Analyze current state
    console.log('📋 Task 1: Analyzing current database files...');
    const analysis = analyzeDatabaseFiles();
    console.log(`   📊 Found ${analysis.total} files in migrations/`);
    console.log(`   🚨 Found ${analysis.criticalIssues.length} critical issues`);
    console.log(`   🧹 Found ${analysis.artifactFiles.length} build artifacts`);
    
    // Show classification breakdown
    Object.entries(analysis.classified).forEach(([category, files]) => {
      if (files.length > 0) {
        console.log(`   📦 ${category}: ${files.length} files`);
      }
    });
    
    if (analysis.unclassified.length > 0) {
      console.log(`   ❓ Unclassified: ${analysis.unclassified.length} files`);
    }
    
    // 2. Create organized structure
    if (!dryRun) {
      console.log('\n📋 Task 2: Creating organized directory structure...');
      createOrganizedStructure();
    }
    
    // 3. Handle critical issues
    console.log(`\n📋 Task 3: ${dryRun ? 'Analyzing' : 'Fixing'} critical issues...`);
    const criticalHandled = handleCriticalIssues(analysis, dryRun);
    console.log(`   ✅ ${dryRun ? 'Would handle' : 'Handled'} ${criticalHandled} critical issues`);
    
    // 4. Clean build artifacts
    console.log(`\n📋 Task 4: ${dryRun ? 'Analyzing' : 'Cleaning'} build artifacts...`);
    const artifactsCleaned = cleanupArtifacts(analysis, dryRun);
    
    // 5. Organize files
    console.log(`\n📋 Task 5: ${dryRun ? 'Planning' : 'Executing'} file organization...`);
    const organizeResult = organizeFiles(analysis, dryRun);
    console.log(`   📦 ${dryRun ? 'Would move' : 'Moved'} ${dryRun ? organizeResult.operations.length : organizeResult.moved} files`);
    
    // 6. Create documentation
    if (!dryRun) {
      console.log('\n📋 Task 6: Creating organization documentation...');
      createOrganizationREADME();
      console.log('   ✅ Created database/migrations/README.md');
    }
    
    // 7. Generate summary
    const summary = {
      timestamp: new Date().toISOString(),
      analysis,
      operations: organizeResult.operations,
      results: {
        filesAnalyzed: analysis.total,
        criticalIssues: criticalHandled,
        artifactsCleaned: artifactsCleaned,
        filesMoved: dryRun ? organizeResult.operations.length : organizeResult.moved
      }
    };
    
    const reportFile = `database-cleanup-${dryRun ? 'simulation' : 'report'}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(summary, null, 2));
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log(`\n🗄️ Database Cleanup ${dryRun ? 'Simulation' : 'Complete'}!`);
    console.log(`   📊 Files analyzed: ${summary.results.filesAnalyzed}`);
    console.log(`   🚨 Critical issues ${dryRun ? 'identified' : 'fixed'}: ${summary.results.criticalIssues}`);
    console.log(`   🧹 Artifacts ${dryRun ? 'identified' : 'cleaned'}: ${summary.results.artifactsCleaned}`);
    console.log(`   📦 Files ${dryRun ? 'to organize' : 'organized'}: ${summary.results.filesMoved}`);
    console.log(`   ⏱️  Completed in ${duration} seconds`);
    
    // Show organization breakdown
    if (organizeResult.operations.length > 0) {
      console.log(`\n📋 ${dryRun ? 'Planned' : 'Completed'} Organization:`);
      Object.entries(CLASSIFICATION_RULES).forEach(([category, rules]) => {
        const categoryOps = organizeResult.operations.filter(op => op.category === category);
        if (categoryOps.length > 0) {
          console.log(`   📁 ${category}: ${categoryOps.length} files → ${rules.destination}`);
        }
      });
    }
    
    // Show unclassified files that need manual review
    if (analysis.unclassified.length > 0) {
      console.log('\n❓ Files needing manual classification:');
      analysis.unclassified.slice(0, 10).forEach(file => {
        console.log(`   📄 ${file}`);
      });
      if (analysis.unclassified.length > 10) {
        console.log(`   ... and ${analysis.unclassified.length - 10} more files`);
      }
    }
    
    console.log(`\n📋 ${dryRun ? 'Simulation' : 'Cleanup'} report saved to: ${reportFile}`);
    
    if (dryRun) {
      console.log('\n💡 To execute the cleanup, run: node scripts/database-cleanup.js --execute');
    } else {
      console.log('\n🎉 Database folder is now organized and clean!');
    }
    
    return summary;
    
  } catch (error) {
    console.error('❌ Error during database cleanup:', error.message);
    process.exit(1);
  }
}

// Command line interface
if (require.main === module) {
  const dryRun = !process.argv.includes('--execute');
  cleanupDatabaseFolder(dryRun);
}

module.exports = {
  cleanupDatabaseFolder,
  analyzeDatabaseFiles,
  CLASSIFICATION_RULES
};