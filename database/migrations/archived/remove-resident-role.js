#!/usr/bin/env node

/**
 * REMOVE RESIDENT ROLE
 * ====================
 * 
 * This script removes the resident role since only admins can self-register
 * Other users must be invited by their barangay admin
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cdtcbelaimyftpxmzkjf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyfQ.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeResidentRole() {
  console.log('🚀 REMOVE RESIDENT ROLE');
  console.log('=======================');
  
  try {
    // Step 1: Check if resident role exists
    console.log('\n📋 Checking for resident role...');
    const { data: residentRole } = await supabase
      .from('auth_roles')
      .select('*')
      .eq('name', 'resident')
      .single();
    
    if (!residentRole) {
      console.log('✅ Resident role already removed or doesn\'t exist');
      await showFinalRoles();
      return;
    }
    
    console.log('Found resident role:', residentRole.description);
    
    // Step 2: Check if any users have this role
    console.log('\n📋 Checking for users with resident role...');
    const { data: usersWithRole, error: checkError } = await supabase
      .from('auth_user_profiles')
      .select('id, email')
      .eq('role_id', residentRole.id);
    
    if (checkError) {
      console.log('⚠️  Could not check users:', checkError.message);
    } else if (usersWithRole && usersWithRole.length > 0) {
      console.log(`⚠️  Found ${usersWithRole.length} users with resident role`);
      console.log('These users should be reassigned to barangay_staff or deleted');
      console.log('Users affected:');
      usersWithRole.forEach(user => {
        console.log(`   - ${user.email}`);
      });
    }
    
    // Step 3: Delete the resident role
    console.log('\n🗑️  Removing resident role...');
    const { error: deleteError } = await supabase
      .from('auth_roles')
      .delete()
      .eq('name', 'resident');
    
    if (deleteError) {
      console.log('❌ Error removing resident role:', deleteError.message);
      console.log('This may be due to foreign key constraints');
      console.log('Consider reassigning users to a different role first');
    } else {
      console.log('✅ Successfully removed resident role');
    }
    
    await showFinalRoles();
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function showFinalRoles() {
  // Show final roles
  const { data: finalRoles } = await supabase
    .from('auth_roles')
    .select('*')
    .order('name');
  
  console.log('\n🏆 FINAL ROLES IN SYSTEM');
  console.log('========================');
  console.log(`Total roles: ${finalRoles.length}`);
  
  console.log('\nRole Hierarchy:');
  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log('│ Level │ Role            │ Description                       │');
  console.log('├───────┼─────────────────┼───────────────────────────────────┤');
  finalRoles.forEach((role, index) => {
    const name = role.name.padEnd(15);
    const desc = role.description ? role.description.substring(0, 33) : 'N/A';
    console.log(`│   ${index + 1}   │ ${name} │ ${desc.padEnd(33)} │`);
  });
  console.log('└─────────────────────────────────────────────────────────────┘');
  
  console.log('\n📝 Registration Policy:');
  console.log('• Only the first user in a barangay can self-register (becomes admin)');
  console.log('• All other users must be invited by their barangay admin');
  console.log('• No self-service registration for residents');
}

removeResidentRole().catch(console.error);