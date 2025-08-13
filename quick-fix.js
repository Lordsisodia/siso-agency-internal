// Quick fix for infinite loading
// Run this in your browser console when on the SISO app

// Option 1: Override the admin check temporarily
window.localStorage.setItem('siso_temp_admin', 'true');

// Option 2: If you're logged in, add yourself as admin
async function makeUserAdmin() {
  const { createClient } = window.supabase;
  const client = createClient(
    'https://avdgyrepwrvsvwgxrccr.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2ZGd5cmVwd3J2c3Z3Z3hyY2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MzgwODIsImV4cCI6MjA1OTIxNDA4Mn0.8MZ2etAhQ1pTJnK84uoqAFfUirv_kaoYcmKHhKgLAWU'
  );
  
  const { data: { user } } = await client.auth.getUser();
  if (user) {
    console.log('Adding admin role for:', user.email);
    await client.from('user_roles').insert({ user_id: user.id, role: 'admin' });
    console.log('Done! Refresh the page.');
  }
}

makeUserAdmin();