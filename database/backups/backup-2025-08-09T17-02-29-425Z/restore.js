#!/usr/bin/env node
// Restore script for backup 2025-08-09T17-02-29-425Z

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../../../.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function restoreData() {
  const tables = [
  "psgc_regions",
  "psgc_provinces",
  "psgc_cities_municipalities",
  "psgc_barangays",
  "psoc_major_groups",
  "psoc_sub_major_groups",
  "psoc_minor_groups",
  "psoc_unit_groups",
  "psoc_unit_sub_groups",
  "psoc_position_titles",
  "psoc_cross_references",
  "user_profiles",
  "roles",
  "households",
  "residents",
  "resident_relationships"
];
  
  for (const table of tables) {
    const filePath = path.join(__dirname, `${table}.json`);
    
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log(`Restoring ${data.length} records to ${table}...`);
      
      const { error } = await supabase.from(table).insert(data);
      
      if (error) {
        console.error(`Error restoring ${table}:`, error);
      } else {
        console.log(`✅ Restored ${table}`);
      }
    }
  }
}

restoreData();
