# Code Quality Scripts

Scripts for complexity checking, import management, and technical debt tracking.

## Scripts

### `check-complexity.js`
Analyzes code complexity and identifies functions that need refactoring.

### `enforce-complexity.js` 
Enforces complexity limits and fails builds when thresholds are exceeded.

### `fix-complexity.js`
Automatically refactors high-complexity functions when possible.

### `fix-import-order.js`
Fixes import statement ordering according to project standards.

### `fix-unused-imports.js`
Removes unused import statements from files.

### `analyze-imports.js`
Analyzes import patterns and identifies circular dependencies.

### `track-technical-debt.js`
Tracks technical debt metrics and generates reports.

### `refresh-stats.js`
Refreshes all code quality statistics and reports.

### `folder-cleanup.js`
Cleans up folder structure and removes unnecessary files.

### `analyze-structure.js`
Analyzes folder structure and suggests improvements.

## Usage

```bash
# Check code complexity
node scripts/quality/check-complexity.js

# Fix import issues
node scripts/quality/fix-import-order.js
node scripts/quality/fix-unused-imports.js

# Track technical debt
node scripts/quality/track-technical-debt.js
```