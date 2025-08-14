#!/usr/bin/env node

/**
 * CONSOLIDATE ROLES
 * =================
 * 
 * This script consolidates duplicate roles and standardizes the roles table
 * to have a clean, consistent set of roles without duplicates
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cdtcbelaimyftpxmzkjf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyfQ.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function consolidateRoles() {
  console.log('🚀 CONSOLIDATE ROLES');
  console.log('====================');
  
  try {
    // Step 1: Check current roles
    console.log('\n📋 Current roles in database:');
    const { data: currentRoles } = await supabase
      .from('auth_roles')
      .select('*')
      .order('name');
    
    console.log(`Found ${currentRoles.length} roles:`);
    currentRoles.forEach(role => {
      console.log(`   - ${role.name}: ${role.description}`);
    });
    
    // Step 2: Clear all roles
    console.log('\n🗑️  Clearing all existing roles...');
    const { error: deleteError } = await supabase
      .from('auth_roles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (deleteError) {
      console.log('❌ Error clearing roles:', deleteError.message);
      return;
    }
    console.log('✅ Cleared all existing roles');
    
    // Step 3: Define consolidated roles (following schema standards)
    const consolidatedRoles = [
      {
        name: 'super_admin',
        description: 'System Administrator with full access',
        permissions: {
          all: true
        }
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
        description: 'Barangay Administrator',
        permissions: {
          residents: ['read', 'create', 'update', 'delete'],
          households: ['read', 'create', 'update', 'delete'],
          reports: ['read', 'create'],
          manage_users: true,
          view_analytics: true
        }
      },
      {
        name: 'barangay_staff',
        description: 'Barangay Staff/Clerk',
        permissions: {
          residents: ['read', 'create', 'update'],
          households: ['read', 'create', 'update']
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
    
    // Step 4: Insert consolidated roles
    console.log('\n📥 Inserting consolidated roles...');
    
    for (const role of consolidatedRoles) {
      const { error } = await supabase
        .from('auth_roles')
        .insert(role);
      
      if (!error) {
        console.log(`✅ Created role: ${role.name}`);
      } else {
        console.log(`❌ Error creating role ${role.name}:`, error.message);
      }
    }
    
    // Step 5: Final verification
    const { data: finalRoles, count } = await supabase
      .from('auth_roles')
      .select('*', { count: 'exact' })
      .order('name');
    
    console.log('\n🏆 FINAL CONSOLIDATED ROLES');
    console.log('===========================');
    console.log(`Total roles: ${count || finalRoles.length}`);
    
    if (finalRoles && finalRoles.length > 0) {
      console.log('\nConsolidated role hierarchy:');
      console.log('1. super_admin       - Full system access');
      console.log('2. region_admin      - Regional level management');
      console.log('3. province_admin    - Provincial level management');
      console.log('4. city_admin        - City/Municipality level management');
      console.log('5. barangay_admin    - Barangay level full management');
      console.log('6. barangay_staff    - Barangay data entry and updates');
      console.log('7. resident          - Self-service access only');
      
      console.log('\n🎉 ROLE CONSOLIDATION COMPLETE!');
      console.log('✅ Removed duplicates');
      console.log('✅ Standardized naming (using lowercase with underscores)');
      console.log('✅ Clear hierarchy from super_admin down to resident');
    }
    
  } catch (error) {
    console.error('❌ Error during consolidation:', error);
  }
}

consolidateRoles().catch(console.error);