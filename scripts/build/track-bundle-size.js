#!/usr/bin/env node

/**
 * Bundle Size Tracker
 * Tracks bundle size changes over time and alerts on significant increases
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BundleSizeTracker {
  constructor() {
    this.historyFile = path.join(process.cwd(), 'reports', 'bundle-size-history.json');
    this.budgetFile = path.join(process.cwd(), 'config', 'bundle-budget.json');
    this.history = this.loadHistory();
    this.budget = this.loadBudget();
  }

  loadHistory() {
    if (fs.existsSync(this.historyFile)) {
      try {
        return JSON.parse(fs.readFileSync(this.historyFile, 'utf8'));
      } catch (error) {
        console.warn('Could not parse bundle history, starting fresh');
        return [];
      }
    }
    return [];
  }

  loadBudget() {
    if (fs.existsSync(this.budgetFile)) {
      try {
        return JSON.parse(fs.readFileSync(this.budgetFile, 'utf8'));
      } catch (error) {
        console.warn('Could not parse bundle budget');
        return null;
      }
    }
    return null;
  }

  getCurrentBundleSize() {
    const buildDir = path.join(process.cwd(), '.next');
    const staticDir = path.join(buildDir, 'static');
    
    if (!fs.existsSync(staticDir)) {
      throw new Error('No build found. Run `npm run build` first.');
    }
    
    const sizes = {
      javascript: 0,
      css: 0,
      images: 0,
      fonts: 0,
      total: 0,
      files: {}
    };
    
    const walkDir = (dir) => {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else {
          const relativePath = path.relative(staticDir, filePath);
          const size = stat.size;
          
          sizes.files[relativePath] = size;
          sizes.total += size;
          
          if (file.endsWith('.js')) sizes.javascript += size;
          else if (file.endsWith('.css')) sizes.css += size;
          else if (file.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) sizes.images += size;
          else if (file.match(/\.(woff|woff2|eot|ttf|otf)$/)) sizes.fonts += size;
        }
      });
    };
    
    walkDir(staticDir);
    return sizes;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  calculateChange(current, previous) {
    if (!previous) return { change: 0, percent: 0 };
    
    const change = current - previous;
    const percent = previous > 0 ? (change / previous) * 100 : 0;
    
    return { change, percent };
  }

  checkBudgetViolations(sizes) {
    if (!this.budget || !this.budget.files) return [];
    
    const violations = [];
    
    this.budget.files.forEach(budgetRule => {
      const { path: pathPattern, maxSize } = budgetRule;
      
      // Convert budget size to bytes
      const maxBytes = this.parseSizeString(maxSize);
      
      // Find matching files
      const matchingFiles = Object.keys(sizes.files).filter(file => {
        const pattern = pathPattern.replace(/\*/g, '.*');
        return new RegExp(pattern).test(file);
      });
      
      matchingFiles.forEach(file => {
        const fileSize = sizes.files[file];
        if (fileSize > maxBytes) {
          violations.push({
            file,
            actualSize: this.formatBytes(fileSize),
            budgetSize: maxSize,
            overage: this.formatBytes(fileSize - maxBytes),
            description: budgetRule.description || 'Budget violation'
          });
        }
      });
    });
    
    return violations;
  }

  parseSizeString(sizeStr) {
    const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(kb|mb|gb)?$/i);
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    const unit = (match[2] || 'b').toLowerCase();
    
    const multipliers = {
      b: 1,
      kb: 1024,
      mb: 1024 * 1024,
      gb: 1024 * 1024 * 1024
    };
    
    return value * multipliers[unit];
  }

  recordCurrentSize() {
    try {
      const currentSizes = this.getCurrentBundleSize();
      const timestamp = new Date().toISOString();
      
      // Get git commit info if available
      let gitInfo = {};
      try {
        const commit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
        const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
        gitInfo = { commit: commit.substring(0, 7), branch };
      } catch (error) {
        // Git not available or not in a repo
      }
      
      const entry = {
        timestamp,
        ...gitInfo,
        sizes: currentSizes
      };
      
      // Add to history
      this.history.push(entry);
      
      // Keep only last 30 entries
      if (this.history.length > 30) {
        this.history = this.history.slice(-30);
      }
      
      // Save history
      fs.mkdirSync(path.dirname(this.historyFile), { recursive: true });
      fs.writeFileSync(this.historyFile, JSON.stringify(this.history, null, 2));
      
      return entry;
      
    } catch (error) {
      throw new Error(`Failed to record bundle size: ${error.message}`);
    }
  }

  generateReport() {
    const current = this.recordCurrentSize();
    const previous = this.history.length > 1 ? this.history[this.history.length - 2] : null;
    
    console.log('📊 Bundle Size Report');
    console.log('====================');
    console.log(`Timestamp: ${current.timestamp}`);
    if (current.commit) {
      console.log(`Git: ${current.branch}@${current.commit}`);
    }
    
    console.log('\n📦 Current Sizes:');
    console.log(`  JavaScript: ${this.formatBytes(current.sizes.javascript)}`);
    console.log(`  CSS: ${this.formatBytes(current.sizes.css)}`);
    console.log(`  Images: ${this.formatBytes(current.sizes.images)}`);
    console.log(`  Fonts: ${this.formatBytes(current.sizes.fonts)}`);
    console.log(`  Total: ${this.formatBytes(current.sizes.total)}`);
    
    if (previous) {
      console.log('\n📈 Changes from Previous Build:');
      
      const changes = {
        javascript: this.calculateChange(current.sizes.javascript, previous.sizes.javascript),
        css: this.calculateChange(current.sizes.css, previous.sizes.css),
        total: this.calculateChange(current.sizes.total, previous.sizes.total)
      };
      
      Object.entries(changes).forEach(([type, change]) => {
        const symbol = change.change > 0 ? '📈' : change.change < 0 ? '📉' : '➡️';
        const sign = change.change > 0 ? '+' : '';
        console.log(`  ${symbol} ${type}: ${sign}${this.formatBytes(change.change)} (${sign}${change.percent.toFixed(1)}%)`);
      });
      
      // Alert on significant increases
      if (changes.total.percent > 10) {
        console.log('\n⚠️  WARNING: Bundle size increased by more than 10%');
      }
    }
    
    // Check budget violations
    const violations = this.checkBudgetViolations(current.sizes);
    if (violations.length > 0) {
      console.log('\n🚨 Budget Violations:');
      violations.forEach(violation => {
        console.log(`  ❌ ${violation.file}`);
        console.log(`     Size: ${violation.actualSize} (budget: ${violation.budgetSize})`);
        console.log(`     Overage: ${violation.overage}`);
        console.log(`     ${violation.description}\n`);
      });
      
      if (process.argv.includes('--strict')) {
        console.log('Build failed due to budget violations');
        process.exit(1);
      }
    } else {
      console.log('\n✅ All files within budget limits');
    }
    
    // Show trend if we have enough history
    if (this.history.length >= 5) {
      const trend = this.calculateTrend();
      console.log(`\n📊 5-build trend: ${trend > 0 ? '📈' : trend < 0 ? '📉' : '➡️'} ${trend.toFixed(1)}% average change`);
    }
  }

  calculateTrend() {
    if (this.history.length < 5) return 0;
    
    const recent = this.history.slice(-5);
    const changes = [];
    
    for (let i = 1; i < recent.length; i++) {
      const change = this.calculateChange(recent[i].sizes.total, recent[i - 1].sizes.total);
      changes.push(change.percent);
    }
    
    return changes.reduce((sum, change) => sum + change, 0) / changes.length;
  }
}

// CLI usage
if (require.main === module) {
  const tracker = new BundleSizeTracker();
  
  try {
    tracker.generateReport();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

module.exports = { BundleSizeTracker };