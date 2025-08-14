#!/usr/bin/env node

/**
 * Database Folder Analyzer
 * Analyzes database directory organization and identifies cleanup opportunities
 */

const fs = require('fs');
const path = require('path');

/**
 * File categorization for database files
 */
const DB_FILE_CATEGORIES = {
  // Current/Active migrations
  active_migrations: {
    patterns: [
      /^add-/, /^create-/, /^setup-/, /^implement-/,
      /^deploy-/, /^production-/
    ],
    priority: 'high',
    description: 'Active migration files'
  },
  
  // Debug and diagnostic files
  debug_files: {
    patterns: [
      /^debug-/, /^check-/, /^analyze-/, /^test-/,
      /^verify-/, /^diagnose-/
    ],
    priority: 'low',
    description: 'Debug and diagnostic files'
  },
  
  // Fix and patch files
  fix_files: {
    patterns: [
      /^fix-/, /^patch-/, /^repair-/, /^correct-/
    ],
    priority: 'medium', 
    description: 'Fix and patch files'
  },
  
  // Import and data files
  import_files: {
    patterns: [
      /^import-/, /^load-/, /^populate-/, /^sync-/,
      /^extract-/, /^backup-/
    ],
    priority: 'medium',
    description: 'Import and data processing files'
  },
  
  // Cleanup and maintenance
  cleanup_files: {
    patterns: [
      /^cleanup-/, /^remove-/, /^delete-/, /^clear-/,
      /^reset-/, /^revert-/
    ],
    priority: 'low',
    description: 'Cleanup and maintenance files'
  },
  
  // Temporary and experimental
  temp_files: {
    patterns: [
      /^temp-/, /^tmp-/, /^draft-/, /^experiment-/,
      /^try-/, /^sample-/, /^manual-/
    ],
    priority: 'very_low',
    description: 'Temporary and experimental files'
  },
  
  // Documentation files
  documentation: {
    patterns: [/\.md$/, /\.txt$/, /README/, /GUIDE/],
    priority: 'medium',
    description: 'Documentation files'
  }
};

/**
 * Analyze database directory structure
 */
function analyzeDatabaseDirectory() {
  console.log('📊 Analyzing database directory structure...');
  
  const analysis = {
    totalFiles: 0,
    directories: {},
    fileTypes: {},
    categories: {},
    issues: []
  };
  
  // Initialize categories
  Object.keys(DB_FILE_CATEGORIES).forEach(cat => {
    analysis.categories[cat] = [];
  });
  analysis.categories.uncategorized = [];
  
  function scanDirectory(dirPath, relativePath = '') {
    if (!fs.existsSync(dirPath)) return;
    
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const itemRelativePath = path.join(relativePath, item).replace(/\\/g, '/');
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        if (!analysis.directories[itemRelativePath]) {
          analysis.directories[itemRelativePath] = {
            files: 0,
            subdirs: 0,
            size: 0
          };
        }
        
        scanDirectory(itemPath, itemRelativePath);
      } else {
        analysis.totalFiles++;
        
        // Track by directory
        const dirKey = relativePath || 'root';
        if (!analysis.directories[dirKey]) {
          analysis.directories[dirKey] = { files: 0, subdirs: 0, size: 0 };
        }
        analysis.directories[dirKey].files++;
        analysis.directories[dirKey].size += stat.size;
        
        // Track by file type
        const ext = path.extname(item);
        analysis.fileTypes[ext] = (analysis.fileTypes[ext] || 0) + 1;
        
        // Categorize file
        categorizeFile(item, itemRelativePath, analysis);
      }
    }
  }
  
  scanDirectory('database');
  
  return analysis;
}

/**
 * Categorize a database file
 */
function categorizeFile(fileName, relativePath, analysis) {
  let categorized = false;
  
  for (const [category, config] of Object.entries(DB_FILE_CATEGORIES)) {
    if (config.patterns.some(pattern => pattern.test(fileName))) {
      analysis.categories[category].push({
        file: fileName,
        path: relativePath,
        priority: config.priority
      });
      categorized = true;
      break;
    }
  }
  
  if (!categorized) {
    analysis.categories.uncategorized.push({
      file: fileName,
      path: relativePath,
      priority: 'unknown'
    });
  }
}

/**
 * Identify organizational issues
 */
function identifyIssues(analysis) {
  const issues = [];
  
  // Too many files in migrations root
  const migrationsFiles = analysis.directories['migrations']?.files || 0;
  if (migrationsFiles > 50) {
    issues.push({
      type: 'excessive_files',
      severity: 'high',
      location: 'migrations/',
      count: migrationsFiles,
      message: `Excessive files in migrations/ directory (${migrationsFiles} files)`,
      recommendation: 'Organize into subdirectories by date or purpose'
    });
  }
  
  // Check for node_modules in database
  if (analysis.directories['migrations/node_modules']) {
    issues.push({
      type: 'wrong_location',
      severity: 'high',
      location: 'migrations/node_modules',
      message: 'node_modules directory should not be in database/migrations/',
      recommendation: 'Move package.json and node_modules to project root or remove'
    });
  }
  
  // Too many debug files
  const debugCount = analysis.categories.debug_files.length;
  if (debugCount > 20) {
    issues.push({
      type: 'debug_clutter',
      severity: 'medium',
      count: debugCount,
      message: `Too many debug files (${debugCount} files)`,
      recommendation: 'Archive old debug files or create debug/ subdirectory'
    });
  }
  
  // Too many temporary files
  const tempCount = analysis.categories.temp_files.length;
  if (tempCount > 10) {
    issues.push({
      type: 'temp_clutter',
      severity: 'medium',
      count: tempCount,
      message: `Too many temporary files (${tempCount} files)`,
      recommendation: 'Remove outdated temporary files'
    });
  }
  
  // Check for backup files that should be moved
  if (analysis.directories['migrations/backup-2025-08-09T17-02-29-425Z']) {
    issues.push({
      type: 'backup_location',
      severity: 'low',
      location: 'migrations/backup-*',
      message: 'Backup files mixed with migrations',
      recommendation: 'Move backups to database/backups/ directory'
    });
  }
  
  return issues;
}

/**
 * Generate cleanup recommendations
 */
function generateCleanupPlan(analysis) {
  const plan = {
    immediate: [],
    organize: [],
    archive: [],
    remove: []
  };
  
  // Immediate actions
  if (analysis.directories['migrations/node_modules']) {
    plan.immediate.push({
      action: 'remove',
      target: 'database/migrations/node_modules/',
      reason: 'Wrong location for dependencies'
    });
  }
  
  // Organization actions
  const migrationsFiles = analysis.directories['migrations']?.files || 0;
  if (migrationsFiles > 50) {
    plan.organize.push({
      action: 'create_subdirectories',
      target: 'database/migrations/',
      subdirs: ['active/', 'archived/', 'debug/', 'backups/'],
      reason: 'Reduce clutter in migrations root'
    });
  }
  
  // Archive candidates (low priority files)
  ['debug_files', 'temp_files', 'cleanup_files'].forEach(category => {
    if (analysis.categories[category].length > 5) {
      plan.archive.push({
        action: 'archive',
        category: category,
        count: analysis.categories[category].length,
        destination: `database/migrations/archived/${category.replace('_files', '')}/`
      });
    }
  });
  
  // Remove candidates (very old temporary files)
  analysis.categories.temp_files.forEach(file => {
    if (file.file.includes('temp') || file.file.includes('tmp') || file.file.includes('test')) {
      plan.remove.push({
        action: 'review_for_removal',
        file: file.path,
        reason: 'Potentially outdated temporary file'
      });
    }
  });
  
  return plan;
}

/**
 * Generate database cleanup report
 */
function generateDatabaseCleanupReport() {
  console.log('🗄️ Database Folder Organization Analysis');
  console.log('🎯 Analyzing database directory for organizational issues...\n');
  
  const startTime = Date.now();
  
  try {
    // 1. Analyze structure
    console.log('📋 Task 1: Analyzing database directory structure...');
    const analysis = analyzeDatabaseDirectory();
    console.log(`   📊 Found ${analysis.totalFiles} total files`);
    
    // 2. Identify issues
    console.log('\n📋 Task 2: Identifying organizational issues...');
    const issues = identifyIssues(analysis);
    console.log(`   ⚠️  Found ${issues.length} organizational issues`);
    
    // 3. Generate cleanup plan
    console.log('\n📋 Task 3: Generating cleanup recommendations...');
    const cleanupPlan = generateCleanupPlan(analysis);
    const totalActions = cleanupPlan.immediate.length + cleanupPlan.organize.length + 
                        cleanupPlan.archive.length + cleanupPlan.remove.length;
    console.log(`   💡 Generated ${totalActions} cleanup recommendations`);
    
    // 4. Create report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: analysis.totalFiles,
        totalDirectories: Object.keys(analysis.directories).length,
        issues: issues.length,
        cleanupActions: totalActions
      },
      analysis,
      issues,
      cleanupPlan,
      fileTypeBreakdown: analysis.fileTypes,
      categoryBreakdown: Object.fromEntries(
        Object.entries(analysis.categories).map(([k, v]) => [k, v.length])
      )
    };
    
    fs.writeFileSync('database-cleanup-analysis.json', JSON.stringify(report, null, 2));
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    // Console output
    console.log('\n🗄️ Database Organization Analysis Results:');
    console.log(`   📊 Total Files: ${report.summary.totalFiles}`);
    console.log(`   📁 Directories: ${report.summary.totalDirectories}`);
    console.log(`   ⚠️  Issues Found: ${report.summary.issues}`);
    console.log(`   💡 Cleanup Actions: ${report.summary.cleanupActions}`);
    console.log(`   ⏱️  Completed in ${duration} seconds\n`);
    
    // Show file type breakdown
    console.log('📋 File Type Breakdown:');
    Object.entries(analysis.fileTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .forEach(([ext, count]) => {
        const extension = ext || 'no extension';
        console.log(`   ${extension}: ${count} files`);
      });
    console.log('');
    
    // Show critical issues
    const criticalIssues = issues.filter(i => i.severity === 'high');
    if (criticalIssues.length > 0) {
      console.log('🚨 Critical Issues:');
      criticalIssues.forEach(issue => {
        console.log(`   ❌ ${issue.message}`);
        console.log(`      💡 ${issue.recommendation}`);
      });
      console.log('');
    }
    
    // Show cleanup priorities
    if (cleanupPlan.immediate.length > 0) {
      console.log('⚡ Immediate Actions Needed:');
      cleanupPlan.immediate.forEach(action => {
        console.log(`   🔧 ${action.action}: ${action.target}`);
        console.log(`      📝 ${action.reason}`);
      });
      console.log('');
    }
    
    // Show organization recommendations
    if (cleanupPlan.organize.length > 0) {
      console.log('📁 Organization Recommendations:');
      cleanupPlan.organize.forEach(action => {
        console.log(`   📂 ${action.action}: ${action.target}`);
        if (action.subdirs) {
          console.log(`      📋 Create: ${action.subdirs.join(', ')}`);
        }
      });
      console.log('');
    }
    
    console.log('📋 Detailed analysis saved to: database-cleanup-analysis.json');
    
    return report;
    
  } catch (error) {
    console.error('❌ Error during database analysis:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  generateDatabaseCleanupReport();
}

module.exports = {
  analyzeDatabaseDirectory,
  generateDatabaseCleanupReport,
  DB_FILE_CATEGORIES
};