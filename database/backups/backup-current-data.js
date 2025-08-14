#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../../.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function backupData() {
  console.log('🔄 BACKING UP CURRENT DATABASE DATA');
  console.log('=====================================\n');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, `backup-${timestamp}`);
  
  // Create backup directory
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  try {
    // Tables to backup
    const tables = [
      'psgc_regions',
      'psgc_provinces', 
      'psgc_cities_municipalities',
      'psgc_barangays',
      'psoc_major_groups',
      'psoc_sub_major_groups',
      'psoc_minor_groups',
      'psoc_unit_groups',
      'psoc_unit_sub_groups',
      'psoc_position_titles',
      'psoc_cross_references',
      'user_profiles',
      'roles',
      'households',
      'residents',
      'resident_relationships'
    ];
    
    for (const table of tables) {
      console.log(`📦 Backing up ${table}...`);
      
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(100000);
      
      if (error) {
        console.log(`⚠️ Skipping ${table}: ${error.message}`);
        continue;
      }
      
      if (data && data.length > 0) {
        const filePath = path.join(backupDir, `${table}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`✅ Backed up ${data.length} records from ${table}`);
      } else {
        console.log(`📭 No data in ${table}`);
      }
    }
    
    console.log(`\n✅ Backup completed: ${backupDir}`);
    
    // Create restore script
    const restoreScript = `#!/usr/bin/env node
// Restore script for backup ${timestamp}

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../../../.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function restoreData() {
  const tables = ${JSON.stringify(tables, null, 2)};
  
  for (const table of tables) {
    const filePath = path.join(__dirname, \`\${table}.json\`);
    
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log(\`Restoring \${data.length} records to \${table}...\`);
      
      const { error } = await supabase.from(table).insert(data);
      
      if (error) {
        console.error(\`Error restoring \${table}:\`, error);
      } else {
        console.log(\`✅ Restored \${table}\`);
      }
    }
  }
}

restoreData();
`;
    
    fs.writeFileSync(path.join(backupDir, 'restore.js'), restoreScript);
    console.log('📝 Created restore.js script in backup folder');
    
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
  }
}

// Run backup
if (require.main === module) {
  backupData();
}

module.exports = { backupData };