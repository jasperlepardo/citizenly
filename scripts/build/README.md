# Build Scripts

Scripts for build optimization, bundle analysis, and deployment preparation.

## Scripts

### `build-env.mjs`
Environment configuration for builds across different environments.

### `analyze-bundle.js` 
Analyzes webpack bundle composition and identifies optimization opportunities.

### `monitor-bundle-size.js`
Monitors bundle size changes and alerts on significant increases.

### `track-bundle-size.js`
Tracks bundle size history and generates reports.

### `prepare-storybook.js`
Prepares Storybook for deployment with proper configuration.

### `analyze-webpack.js`
Advanced webpack bundle analysis with performance recommendations.

## Usage

```bash
# Analyze current bundle
node scripts/build/analyze-bundle.js

# Monitor bundle size changes
node scripts/build/monitor-bundle-size.js

# Prepare Storybook for deployment
node scripts/build/prepare-storybook.js
```