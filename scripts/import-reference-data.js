const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

const root = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(root, '.env.development') });
dotenv.config({ path: path.join(root, '.env.local'), override: true });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const files = [
  {
    table: 'psgc_regions',
    file: 'database/reference-data/psgc/psgc_regions.updated.csv',
    map: row => ({ code: row.code, name: row.name, is_active: true }),
  },
  {
    table: 'psgc_provinces',
    file: 'database/reference-data/psgc/psgc_provinces.updated.csv',
    map: row => ({ code: row.code, name: row.name, region_code: row.region_code, is_active: true }),
  },
  {
    table: 'psgc_cities_municipalities',
    file: 'database/reference-data/psgc/psgc_cities_municipalities.updated.fixed.csv',
    map: row => {
      const isIndependent = parseBoolean(row.is_independent);
      return {
        code: row.code,
        name: row.name,
        province_code: isIndependent ? null : emptyToNull(row.province_code),
        type: row.type,
        is_independent: isIndependent,
        is_active: true,
      };
    },
  },
  {
    table: 'psgc_barangays',
    file: 'database/reference-data/psgc/psgc_barangays.updated.csv',
    map: row => ({
      code: row.code,
      name: row.name,
      city_municipality_code: row.city_municipality_code,
      is_active: true,
    }),
  },
  {
    table: 'psoc_major_groups',
    file: 'database/reference-data/psoc/psoc_major_groups_clean_from_user.csv',
    map: row => ({ code: row.code, title: row.title }),
  },
  {
    table: 'psoc_sub_major_groups',
    file: 'database/reference-data/psoc/psoc_sub_major_groups_clean_from_user.csv',
    map: row => ({ code: row.code, title: row.title, major_code: row.major_code }),
  },
  {
    table: 'psoc_minor_groups',
    file: 'database/reference-data/psoc/psoc_minor_groups_clean_from_user.csv',
    map: row => ({ code: row.code, title: row.title, sub_major_code: row.sub_major_code }),
  },
  {
    table: 'psoc_unit_groups',
    file: 'database/reference-data/psoc/psoc_unit_groups_clean_from_user.csv',
    map: row => ({ code: row.code, title: row.title, minor_code: row.minor_code }),
  },
];

function emptyToNull(value) {
  const trimmed = String(value ?? '').trim();
  return trimmed === '' ? null : trimmed;
}

function parseBoolean(value) {
  return ['true', 't', '1', 'yes', 'y'].includes(String(value ?? '').trim().toLowerCase());
}

function parseCsv(content) {
  const rows = [];
  let field = '';
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    const next = content[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(field);
      if (row.some(value => value !== '')) rows.push(row);
      field = '';
      row = [];
    } else {
      field += char;
    }
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  const [headers, ...data] = rows;
  return data.map(values =>
    Object.fromEntries(headers.map((header, index) => [header.trim(), values[index] ?? '']))
  );
}

function readRows(relativePath, map) {
  const content = fs.readFileSync(path.join(root, relativePath), 'utf8');
  return parseCsv(content).map(map);
}

async function upsertInChunks(table, rows, chunkSize = 500) {
  let imported = 0;
  for (let start = 0; start < rows.length; start += chunkSize) {
    const chunk = rows.slice(start, start + chunkSize);
    const { error } = await supabase.from(table).upsert(chunk, { onConflict: 'code' });
    if (error) {
      throw new Error(`${table}: ${error.message}`);
    }
    imported += chunk.length;
    process.stdout.write(`\r${table}: ${imported}/${rows.length}`);
  }
  process.stdout.write('\n');
}

async function getCount(table) {
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
  if (error) throw new Error(`${table} count: ${error.message}`);
  return count;
}

async function main() {
  for (const entry of files) {
    const rows = readRows(entry.file, entry.map);
    await upsertInChunks(entry.table, rows);
  }

  console.log('\nCounts after import:');
  for (const entry of files) {
    console.log(`${entry.table}: ${await getCount(entry.table)}`);
  }
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
