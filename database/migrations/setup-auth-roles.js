#!/usr/bin/env node

/**
 * SETUP AUTH ROLES
 * ================
 * 
 * This script sets up the basic roles needed for the registration system
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cdtcbelaimyftpxmzkjf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyfQ.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAuthRoles() {
  console.log('🚀 SETUP AUTH ROLES');
  console.log('==================');
  
  try {
    // Step 1: Check existing roles
    console.log('\n📋 Checking existing roles...');
    const { data: existingRoles, error: checkError } = await supabase
      .from('auth_roles')
      .select('*');
    
    if (checkError) {
      console.log('❌ Error checking roles:', checkError.message);
      return;
    }
    
    console.log(`📊 Found ${existingRoles.length} existing roles`);
    if (existingRoles.length > 0) {
      console.log('Existing roles:');
      existingRoles.forEach(role => {
        console.log(`   - ${role.name}: ${role.description}`);
      });
    }
    
    // Step 2: Define basic roles needed for the system
    const basicRoles = [
      {
        name: 'superadmin',
        description: 'Super Administrator with full system access',
        permissions: {
          system: ['all'],
          users: ['create', 'read', 'update', 'delete'],
          residents: ['create', 'read', 'update', 'delete'],
          households: ['create', 'read', 'update', 'delete'],
          reports: ['create', 'read', 'export'],
          settings: ['manage']
        }
      },
      {
        name: 'admin',
        description: 'Administrator with broad access',
        permissions: {
          users: ['create', 'read', 'update'],
          residents: ['create', 'read', 'update', 'delete'],
          households: ['create', 'read', 'update', 'delete'],
          reports: ['create', 'read', 'export']
        }
      },
      {
        name: 'barangay_admin',
        description: 'Barangay Administrator',
        permissions: {
          residents: ['create', 'read', 'update', 'delete'],
          households: ['create', 'read', 'update', 'delete'],
          reports: ['create', 'read', 'export'],
          users: ['read']
        }
      },
      {
        name: 'barangay_staff',
        description: 'Barangay Staff member',
        permissions: {
          residents: ['create', 'read', 'update'],
          households: ['create', 'read', 'update'],
          reports: ['read']
        }
      },
      {
        name: 'user',
        description: 'Regular user with basic access',
        permissions: {
          residents: ['read'],
          households: ['read'],
          profile: ['read', 'update']
        }
      }
    ];
    
    // Step 3: Insert missing roles
    console.log('\n📥 Setting up roles...');
    let created = 0;
    let skipped = 0;
    
    for (const role of basicRoles) {
      // Check if role already exists
      const exists = existingRoles.some(r => r.name === role.name);
      
      if (!exists) {
        const { error: insertError } = await supabase
          .from('auth_roles')
          .insert(role);
        
        if (!insertError) {
          created++;
          console.log(`✅ Created role: ${role.name}`);
        } else {
          console.log(`❌ Error creating role ${role.name}:`, insertError.message);
        }
      } else {
        skipped++;
        console.log(`⏭️  Role already exists: ${role.name}`);
      }
    }
    
    console.log(`\n📊 Summary: Created ${created} roles, skipped ${skipped} existing roles`);
    
    // Step 4: Final verification
    const { data: finalRoles, count } = await supabase
      .from('auth_roles')
      .select('*', { count: 'exact' });
    
    console.log('\n🏆 FINAL VERIFICATION');
    console.log('====================');
    console.log(`Total roles in database: ${count || finalRoles.length}`);
    
    if (finalRoles && finalRoles.length > 0) {
      console.log('\nAll roles:');
      finalRoles.forEach(role => {
        console.log(`   ✅ ${role.name}: ${role.description}`);
      });
      console.log('\n🎉 AUTH ROLES SETUP COMPLETE!');
      console.log('Users can now register with these roles.');
    } else {
      console.log('⚠️  No roles found after setup. Please check for errors.');
    }
    
  } catch (error) {
    console.error('❌ Error during setup:', error);
  }
}

setupAuthRoles().catch(console.error);