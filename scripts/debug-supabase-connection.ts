/**
 * Debug script to test Supabase connection and user mapping
 * Run with: npx tsx scripts/debug-supabase-connection.ts
 */

import { createClient } from '@supabase/supabase-js';

// Get env vars (in Vite these would be import.meta.env.VITE_*)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://avdgyrepwrvsvwgxrccr.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2ZGd5cmVwd3J2c3Z3Z3hyY2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MzgwODIsImV4cCI6MjA1OTIxNDA4Mn0.8MZ2etAhQ1pTJnK84uoqAFfUirv_kaoYcmKHhKgLAWU';

console.log('🔍 Supabase Connection Debug');
console.log('==========================\n');

console.log('📍 Connection Details:');
console.log('  URL:', supabaseUrl);
console.log('  Key:', supabaseAnonKey.substring(0, 20) + '...\n');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🧪 Test 1: Basic Connection');
  console.log('----------------------------');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, supabase_id, created_at')
      .limit(5);
    
    if (error) {
      console.log('❌ Error:', error.message);
      console.log('   Details:', error.details);
      console.log('   Hint:', error.hint);
      console.log('   Code:', error.code);
    } else {
      console.log('✅ Connection successful!');
      console.log(`   Found ${data?.length || 0} users`);
      
      if (data && data.length > 0) {
        console.log('\n📊 Sample user data:');
        data.forEach((user, i) => {
          console.log(`   ${i + 1}. ID: ${user.id}`);
          console.log(`      Supabase ID: ${user.supabase_id}`);
          console.log(`      Created: ${user.created_at}`);
        });
      }
    }
  } catch (err) {
    console.log('❌ Exception:', err);
  }

  console.log('\n🧪 Test 2: Check Task Tables');
  console.log('----------------------------');

  const tables = ['light_work_tasks', 'deep_work_tasks', 'morning_routine_tasks'];
  
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table}:`, error.message);
      } else {
        console.log(`✅ ${table}: ${count || 0} records`);
      }
    } catch (err) {
      console.log(`❌ ${table}:`, err);
    }
  }

  console.log('\n🧪 Test 3: User ID Mapping Pattern');
  console.log('----------------------------------');
  
  // Try to find users with prisma-user prefix
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, supabase_id')
      .like('supabase_id', 'prisma-user-%')
      .limit(3);
    
    if (error) {
      console.log('❌ Error:', error.message);
    } else {
      if (data && data.length > 0) {
        console.log(`✅ Found ${data.length} users with prisma-user prefix:`);
        data.forEach((user, i) => {
          console.log(`   ${i + 1}. ${user.supabase_id} → ${user.id}`);
        });
      } else {
        console.log('⚠️  No users found with prisma-user prefix');
        console.log('   This explains why user ID mapping is failing!');
      }
    }
  } catch (err) {
    console.log('❌ Exception:', err);
  }

  console.log('\n🎯 Diagnosis Complete');
  console.log('====================\n');
}

testConnection().catch(console.error);
