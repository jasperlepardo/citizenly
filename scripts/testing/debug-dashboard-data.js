const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://cdtcbelaimyftpxmzkjf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4ODg1OTIsImV4cCI6MjA3MDQ2NDU5Mn0.VGhrjkrEECW9m8U_aeQOZd9jT6hLFOF8ML3tWJNuOOE'
);

async function checkDashboardData() {
  console.log('Checking dashboard data for barangay 042114014...');
  
  // Check if data exists in api_dashboard_stats view
  const { data: statsData, error: statsError } = await supabase
    .from('api_dashboard_stats')
    .select('*')
    .eq('barangay_code', '042114014')
    .maybeSingle();
    
  console.log('Stats data:', statsData);
  console.log('Stats error:', statsError);
  
  // Check if residents exist for this barangay
  const { data: residentsData, error: residentsError } = await supabase
    .from('residents')
    .select('id, first_name, last_name, birthdate, sex, barangay_code')
    .eq('barangay_code', '042114014');
    
  console.log('Residents data:', residentsData);
  console.log('Residents error:', residentsError);
  
  // Check user profile
  const { data: profileData, error: profileError } = await supabase
    .from('auth_user_profiles')
    .select('*')
    .limit(1);
    
  console.log('User profile sample:', profileData?.[0]);
  console.log('Profile error:', profileError);
}

checkDashboardData().catch(console.error);