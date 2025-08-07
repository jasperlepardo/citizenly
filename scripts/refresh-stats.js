#!/usr/bin/env node

/**
 * Materialized View Refresh Utility
 * Refreshes barangay statistics materialized view for updated dashboard performance
 */

/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Missing environment variables');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Refresh materialized views
 */
async function refreshMaterializedViews() {
  console.log('🚀 Starting materialized view refresh...\n');

  const startTime = Date.now();

  try {
    // 1. Refresh barangay_quick_stats materialized view
    console.log('📊 Refreshing barangay_quick_stats...');
    const { error: refreshError } = await supabase.rpc('refresh_barangay_stats');

    if (refreshError) {
      console.error('❌ Failed to refresh materialized view:', refreshError.message);
      process.exit(1);
    }

    console.log('✅ Materialized view refreshed successfully');

    // 2. Get statistics to verify
    console.log('\n📈 Verifying refresh...');
    const { data: stats, error: statsError } = await supabase
      .from('barangay_quick_stats')
      .select(
        'barangay_code, total_residents, senior_citizens, pwd_count, registered_voters, ofw_count'
      )
      .order('barangay_code')
      .limit(5);

    if (statsError) {
      console.error('❌ Failed to verify stats:', statsError.message);
    } else {
      console.log('✅ Sample statistics after refresh:');
      console.table(stats);
    }

    // 3. Get performance overview
    console.log('\n🔧 Database performance overview:');
    const { data: performance, error: perfError } = await supabase
      .from('performance_overview')
      .select('*');

    if (perfError) {
      console.error('❌ Failed to get performance stats:', perfError.message);
    } else {
      console.table(performance);
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✨ Refresh completed in ${totalTime}s`);
    console.log('\n💡 Dashboard performance should now be significantly improved!');
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

/**
 * Check current materialized view status
 */
async function checkMaterializedViewStatus() {
  console.log('🔍 Checking materialized view status...\n');

  try {
    // Check if materialized view exists and has data
    const { data, count, error } = await supabase
      .from('barangay_quick_stats')
      .select('*', { count: 'exact' });

    if (error) {
      console.error('❌ Error accessing materialized view:', error.message);
      console.log('💡 This might mean the materialized view needs to be created first.');
      return false;
    }

    if (!data || data.length === 0) {
      console.log('⚠️  Materialized view exists but contains no data');
      console.log('💡 This means it needs to be refreshed.');
      return false;
    }

    console.log(`✅ Materialized view is healthy with ${count} barangay records`);
    console.log('\n📊 Top 5 barangays by population:');

    const topBarangays = data
      .sort((a, b) => b.total_residents - a.total_residents)
      .slice(0, 5)
      .map(b => ({
        barangay: b.barangay_code,
        residents: b.total_residents,
        seniors: b.senior_citizens,
        pwd: b.pwd_count,
      }));

    console.table(topBarangays);
    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'status':
    case 'check':
      await checkMaterializedViewStatus();
      break;

    case 'refresh':
    case 'update':
      await refreshMaterializedViews();
      break;

    default:
      console.log('📊 Materialized View Refresh Utility\n');
      console.log('Usage:');
      console.log('  node scripts/refresh-stats.js refresh  - Refresh materialized views');
      console.log('  node scripts/refresh-stats.js status   - Check current status');
      console.log('');
      console.log('Examples:');
      console.log('  npm run refresh-stats               - Refresh views');
      console.log('  node scripts/refresh-stats.js check - Check status');
      console.log('');
      console.log(
        '💡 This should be run periodically (daily/weekly) for optimal dashboard performance.'
      );
      break;
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { refreshMaterializedViews, checkMaterializedViewStatus };
