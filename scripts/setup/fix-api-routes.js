// =============================================================================
// API ROUTE FIXES FOR CLEANED SCHEMA
// This script fixes the API routes to match your cleaned database schema
// =============================================================================

const fs = require('fs');
const path = require('path');

const API_RESIDENTS_PATH = 'src/app/api/residents/route.ts';

function fixResidentsAPI() {
  console.log('🔧 Fixing residents API route...');
  
  const content = fs.readFileSync(API_RESIDENTS_PATH, 'utf8');
  
  let fixedContent = content;
  
  // 1. Remove encryption key checks (lines 231-241)
  fixedContent = fixedContent.replace(
    /\/\/ RBI v3 Preflight Check 2: Verify encryption key is active[\s\S]*?console\.log\('\[RBI v3\] Active encryption key verified'\);/g,
    '// RBI v3 Preflight Check 2: Encryption removed - skip key verification\n    console.log(\'[RBI v3] Encryption disabled - proceeding without key check\');'
  );
  
  // 2. Remove encryption key validation
  fixedContent = fixedContent.replace(
    /const { data: encryptionKey, error: keyError }[\s\S]*?return createErrorResponse\('Activate pii_master_key\.', 500\);[\s\S]*?}/g,
    '// Encryption key check removed'
  );
  
  // 3. Fix residents_decrypted to residents in GET endpoint
  fixedContent = fixedContent.replace(
    /\.from\('residents_decrypted'\)/g,
    ".from('residents')"
  );
  
  // 4. Remove RPC call and use direct insert
  fixedContent = fixedContent.replace(
    /\/\/ Execute RBI v3 RPC call[\s\S]*?const { data: residentId, error: createError } = await supabaseAdmin\.rpc\('insert_resident_encrypted', rpcParams\);/g,
    `// Execute direct insert (RPC removed)
    const { data: insertedResident, error: createError } = await supabaseAdmin
      .from('residents')
      .insert([{
        // Required fields
        first_name: effectiveData.firstName,
        last_name: effectiveData.lastName,
        birthdate: effectiveData.birthdate,
        sex: effectiveData.sex,
        barangay_code: effectiveBarangayCode,
        
        // Optional fields
        middle_name: effectiveData.middleName || null,
        mobile_number: effectiveData.mobileNumber || null,
        telephone_number: effectiveData.telephoneNumber || null,
        email: effectiveData.email || null,
        mother_maiden_first: effectiveData.motherMaidenFirstName || null,
        mother_maiden_middle: effectiveData.motherMaidenMiddleName || null,
        mother_maiden_last: effectiveData.motherMaidenLastName || null,
        household_code: effectiveData.household_code || null,
        city_municipality_code: effectiveData.cityMunicipalityCode || null,
        province_code: effectiveData.provinceCode || null,
        region_code: effectiveData.regionCode || null,
        
        // Additional fields
        civil_status: effectiveData.civilStatus || 'single',
        citizenship: effectiveData.citizenship || 'filipino',
        blood_type: effectiveData.bloodType || 'unknown',
        ethnicity: effectiveData.ethnicity || 'not_reported',
        religion: effectiveData.religion || 'prefer_not_to_say',
        employment_status: effectiveData.employmentStatus || 'not_in_labor_force',
        education_attainment: effectiveData.educationAttainment || null,
        is_graduate: effectiveData.isGraduate || false,
        psoc_code: effectiveData.psocCode || null,
        psoc_level: effectiveData.psocLevel || null,
        occupation_title: effectiveData.occupationTitle || null,
        is_voter: effectiveData.isVoter || false,
        is_resident_voter: effectiveData.isResidentVoter || false,
        is_active: true,
        created_by: user.id,
        updated_by: user.id
      }])
      .select('id')
      .single();
    
    const residentId = insertedResident?.id;`
  );
  
  // 5. Remove fallback insert code (it's now the main code)
  fixedContent = fixedContent.replace(
    /\/\/ Check if function doesn't exist, fall back to direct insert[\s\S]*?console\.log\('\[RBI v3\] Direct insert successful, resident ID:', fallbackResident\?\.id\);[\s\S]*?}\);[\s\S]*?}/g,
    '// Direct insert is now the primary method'
  );
  
  // 6. Remove residents_masked view reference
  fixedContent = fixedContent.replace(
    /\/\/ RBI v3 Post-insert: Fetch masked confirmation data \(no PII\)[\s\S]*?\.from\('residents_masked'\)[\s\S]*?\.single\(\);/g,
    `// RBI v3 Post-insert: Fetch basic confirmation data
    const { data: confirmation, error: confirmError } = await supabaseAdmin
      .from('residents')
      .select('first_name, last_name, birthdate, sex, barangay_code, created_at')
      .eq('id', residentId)
      .single();`
  );
  
  // 7. Update confirmation data field names
  fixedContent = fixedContent.replace(
    /first_name_masked, last_name_masked, age, sex, barangay_code, created_at/g,
    'first_name, last_name, birthdate, sex, barangay_code, created_at'
  );
  
  // 8. Remove plaintext field references in fallback
  fixedContent = fixedContent.replace(
    /first_name_plaintext:/g, 'first_name:'
  );
  fixedContent = fixedContent.replace(
    /last_name_plaintext:/g, 'last_name:'
  );
  fixedContent = fixedContent.replace(
    /middle_name_plaintext:/g, 'middle_name:'
  );
  fixedContent = fixedContent.replace(
    /mobile_number_plaintext:/g, 'mobile_number:'
  );
  fixedContent = fixedContent.replace(
    /telephone_number_plaintext:/g, 'telephone_number:'
  );
  fixedContent = fixedContent.replace(
    /email_plaintext:/g, 'email:'
  );
  fixedContent = fixedContent.replace(
    /mother_maiden_first_plaintext:/g, 'mother_maiden_first:'
  );
  fixedContent = fixedContent.replace(
    /mother_maiden_middle_plaintext:/g, 'mother_maiden_middle:'
  );
  fixedContent = fixedContent.replace(
    /mother_maiden_last_plaintext:/g, 'mother_maiden_last:'
  );
  
  // 9. Clean up error message references to encryption
  fixedContent = fixedContent.replace(
    /Activate pii_master_key\./g,
    'Database configuration error.'
  );
  
  // Write the fixed content back
  fs.writeFileSync(API_RESIDENTS_PATH, fixedContent);
  console.log('✅ Residents API route fixed');
}

function fixOtherAPIs() {
  console.log('🔧 Checking other API routes for encryption references...');
  
  const apiDir = 'src/app/api';
  const filesToCheck = [
    'households/route.ts',
    'households/[id]/route.ts',
    'residents/[id]/route.ts',
  ];
  
  filesToCheck.forEach(file => {
    const fullPath = path.join(apiDir, file);
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      // Fix any references to encryption views
      if (content.includes('residents_decrypted') || content.includes('residents_masked')) {
        content = content.replace(/residents_decrypted/g, 'residents');
        content = content.replace(/residents_masked/g, 'residents');
        changed = true;
      }
      
      // Fix any encryption function calls
      if (content.includes('decrypt_pii') || content.includes('encrypt_pii')) {
        console.log(`⚠️  Found encryption function references in ${file} - manual review needed`);
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`✅ Fixed ${file}`);
      }
    }
  });
}

function createTestScript() {
  console.log('📝 Creating API test script...');
  
  const testScript = `// =============================================================================
// API TEST SCRIPT
// Test your API routes after fixing them
// Run with: node test-api.js
// =============================================================================

const TEST_USER_TOKEN = 'your-supabase-auth-token-here'; // Get from browser dev tools
const BASE_URL = 'http://localhost:3000'; // Or your deployment URL

async function testResidentsAPI() {
  console.log('🧪 Testing Residents API...');
  
  // Test data
  const testResident = {
    firstName: 'Test',
    lastName: 'User',
    birthdate: '1990-01-01',
    sex: 'male',
    barangayCode: '137404001', // Use a valid barangay code from your DB
    mobileNumber: '09123456789',
    email: 'test@example.com'
  };
  
  try {
    // Test POST (create resident)
    console.log('Testing POST /api/residents...');
    const createResponse = await fetch(\`\${BASE_URL}/api/residents\`, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${TEST_USER_TOKEN}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testResident)
    });
    
    const createResult = await createResponse.json();
    console.log('Create result:', createResult);
    
    if (createResponse.ok) {
      console.log('✅ POST /api/residents - SUCCESS');
      const residentId = createResult.resident_id;
      
      // Test GET (list residents)
      console.log('Testing GET /api/residents...');
      const listResponse = await fetch(\`\${BASE_URL}/api/residents?page=1&pageSize=10\`, {
        headers: {
          'Authorization': \`Bearer \${TEST_USER_TOKEN}\`
        }
      });
      
      const listResult = await listResponse.json();
      console.log('List result:', listResult);
      
      if (listResponse.ok) {
        console.log('✅ GET /api/residents - SUCCESS');
      } else {
        console.log('❌ GET /api/residents - FAILED');
      }
      
    } else {
      console.log('❌ POST /api/residents - FAILED');
      console.log('Error:', createResult);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

// Run tests
testResidentsAPI();

console.log(\`
🔧 To get your auth token:
1. Open your app in browser and log in
2. Open Developer Tools (F12)
3. Go to Application/Storage > Local Storage
4. Look for 'sb-[project-id]-auth-token'
5. Copy the 'access_token' value
6. Replace TEST_USER_TOKEN above with that value
\`);
`;

  fs.writeFileSync('test-api.js', testScript);
  console.log('✅ Created test-api.js');
}

// Main execution
console.log('🚀 Starting API route fixes...\n');

try {
  fixResidentsAPI();
  fixOtherAPIs();
  createTestScript();
  
  console.log(`
✅ API route fixes completed!

Next steps:
1. Run the database inspection script in Supabase SQL editor
2. Run the cleanup migration script if needed
3. Test your API with the generated test script
4. Deploy your changes

Files created:
- database-inspection.sql (run this first)
- database-cleanup-migration.sql (run if needed)
- test-api.js (test your APIs)
`);

} catch (error) {
  console.error('❌ Error fixing API routes:', error);
  process.exit(1);
}