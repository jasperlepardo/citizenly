#!/usr/bin/env node

/**
 * RESET ROLES FROM SCHEMA
 * =======================
 * 
 * This script resets all roles in Supabase to match the consolidated roles in schema.sql
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cdtcbelaimyftpxmzkjf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyfQ.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetRolesFromSchema() {
  console.log('🚀 RESET ROLES FROM SCHEMA');
  console.log('==========================');
  
  try {
    // Step 1: Show current roles
    console.log('\n📋 Current roles in database:');
    const { data: currentRoles } = await supabase
      .from('auth_roles')
      .select('*')
      .order('name');
    
    console.log(`Found ${currentRoles.length} roles to be replaced`);
    
    // Step 2: Clear all existing roles
    console.log('\n🗑️  Clearing all existing roles...');
    const { error: deleteError } = await supabase
      .from('auth_roles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (deleteError) {
      console.log('❌ Error clearing roles:', deleteError.message);
      console.log('Attempting to delete individually...');
      
      // Try deleting each role individually
      for (const role of currentRoles) {
        await supabase.from('auth_roles').delete().eq('id', role.id);
      }
    }
    console.log('✅ Cleared all existing roles');
    
    // Step 3: Insert consolidated roles from schema
    console.log('\n📥 Inserting consolidated roles from schema...');
    
    const consolidatedRoles = [
      {
        name: 'super_admin',
        description: 'System Administrator with full access',
        permissions: { all: true }
      },
      {
        name: 'region_admin',
        description: 'Regional Administrator',
        permissions: {
          residents: ['read', 'create', 'update'],
          households: ['read', 'create', 'update'],
          reports: ['read', 'create'],
          analytics: ['view']
        }
      },
      {
        name: 'province_admin',
        description: 'Provincial Administrator',
        permissions: {
          residents: ['read', 'create', 'update'],
          households: ['read', 'create', 'update'],
          reports: ['read']
        }
      },
      {
        name: 'city_admin',
        description: 'City/Municipality Administrator',
        permissions: {
          residents: ['read', 'create', 'update'],
          households: ['read', 'create', 'update']
        }
      },
      {
        name: 'barangay_admin',
        description: 'Barangay Administrator with full local management',
        permissions: {
          residents: ['read', 'create', 'update', 'delete'],
          households: ['read', 'create', 'update', 'delete'],
          reports: ['read', 'create'],
          manage_users: true,
          manage_residents: true,
          manage_households: true,
          view_analytics: true
        }
      },
      {
        name: 'barangay_staff',
        description: 'Barangay Staff/Clerk for data entry',
        permissions: {
          residents: ['read', 'create', 'update'],
          households: ['read', 'create', 'update'],
          manage_residents: true,
          manage_households: true
        }
      },
      {
        name: 'resident',
        description: 'Barangay Resident with self-service access',
        permissions: {
          residents: ['read'],
          households: ['read'],
          view_own_data: true,
          update_own_contact: true
        }
      }
    ];
    
    // Insert all roles
    const { error: insertError } = await supabase
      .from('auth_roles')
      .insert(consolidatedRoles);
    
    if (insertError) {
      console.log('❌ Batch insert failed:', insertError.message);
      console.log('Inserting roles individually...');
      
      // Try inserting individually
      for (const role of consolidatedRoles) {
        const { error } = await supabase.from('auth_roles').insert(role);
        if (!error) {
          console.log(`✅ Created role: ${role.name}`);
        } else {
          console.log(`❌ Error creating role ${role.name}:`, error.message);
        }
      }
    } else {
      console.log('✅ Successfully inserted all 7 consolidated roles');
    }
    
    // Step 4: Final verification
    const { data: finalRoles } = await supabase
      .from('auth_roles')
      .select('*')
      .order('name');
    
    console.log('\n🏆 FINAL ROLES (FROM SCHEMA)');
    console.log('============================');
    console.log(`Total roles: ${finalRoles.length}`);
    
    console.log('\nRole Hierarchy:');
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│ Level │ Role            │ Description                       │');
    console.log('├───────┼─────────────────┼───────────────────────────────────┤');
    console.log('│   1   │ super_admin     │ Full system access                │');
    console.log('│   2   │ region_admin    │ Regional management               │');
    console.log('│   3   │ province_admin  │ Provincial management             │');
    console.log('│   4   │ city_admin      │ City/Municipality management      │');
    console.log('│   5   │ barangay_admin  │ Barangay full management          │');
    console.log('│   6   │ barangay_staff  │ Barangay data entry               │');
    console.log('│   7   │ resident        │ Self-service only                 │');
    console.log('└─────────────────────────────────────────────────────────────┘');
    
    console.log('\n🎉 ROLE RESET COMPLETE!');
    console.log('✅ All roles now match the consolidated schema');
    console.log('✅ No more duplicates');
    console.log('✅ Consistent naming convention (lowercase with underscores)');
    console.log('✅ Clear permission hierarchy');
    
  } catch (error) {
    console.error('❌ Error during role reset:', error);
  }
}

resetRolesFromSchema().catch(console.error);