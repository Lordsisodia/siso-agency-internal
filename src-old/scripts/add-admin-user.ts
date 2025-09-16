import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase URL and anon key
const supabaseUrl = 'https://avdgyrepwrvsvwgxrccr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2ZGd5cmVwd3J2c3Z3Z3hyY2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MzgwODIsImV4cCI6MjA1OTIxNDA4Mn0.8MZ2etAhQ1pTJnK84uoqAFfUirv_kaoYcmKHhKgLAWU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addAdminUser() {
  // First, sign in as the user
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'Fuzeheritage123456789@gmail.com',
    password: 'Million2025@SISO'
  });

  if (authError) {
    console.error('Auth error:', authError);
    return;
  }

  if (!authData.user) {
    console.error('No user found');
    return;
  }

  console.log('Signed in as:', authData.user.email);
  console.log('User ID:', authData.user.id);

  // Add admin role
  const { error: roleError } = await supabase
    .from('user_roles')
    .insert({ 
      user_id: authData.user.id, 
      role: 'admin' 
    });

  if (roleError) {
    if (roleError.code === '23505') {
      console.log('User already has admin role');
    } else {
      console.error('Error adding admin role:', roleError);
    }
  } else {
    console.log('Successfully added admin role');
  }

  // Verify the role was added
  const { data: roleData, error: checkError } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', authData.user.id)
    .eq('role', 'admin');

  if (checkError) {
    console.error('Error checking role:', checkError);
  } else {
    console.log('User roles:', roleData);
  }
}

addAdminUser();