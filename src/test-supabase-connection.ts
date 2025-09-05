/**
 * 🧪 Test Supabase Connection Script
 * 
 * Quick test to verify our Supabase hooks are working correctly
 * Run this in browser console to test the connection
 */

import { supabaseAnon } from '@/lib/supabase-clerk';

export async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase connection...');
  
  try {
    // Test 1: Check if we can connect to Supabase
    const { data: users, error: usersError } = await supabaseAnon
      .from('users')
      .select('id, supabase_id, email, display_name')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Users query failed:', usersError);
      return false;
    }
    
    console.log('✅ Users query successful:', users);
    
    // Test 2: Check if we can query tasks
    const { data: lightTasks, error: lightTasksError } = await supabaseAnon
      .from('light_work_tasks')
      .select('id, user_id, title, task_date, completed')
      .limit(5);
    
    if (lightTasksError) {
      console.error('❌ Light tasks query failed:', lightTasksError);
      return false;
    }
    
    console.log('✅ Light work tasks query successful:', lightTasks);
    
    // Test 3: Check if we can query subtasks
    const { data: subtasks, error: subtasksError } = await supabaseAnon
      .from('light_work_subtasks')
      .select('id, task_id, title, completed')
      .limit(5);
    
    if (subtasksError) {
      console.error('❌ Subtasks query failed:', subtasksError);
      return false;
    }
    
    console.log('✅ Subtasks query successful:', subtasks);
    
    console.log('🎉 All Supabase connection tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error);
    return false;
  }
}

// Test user ID mapping
export async function testUserIdMapping(clerkUserId: string) {
  console.log(`🔗 Testing user ID mapping for Clerk user: ${clerkUserId}`);
  
  try {
    const { data, error } = await supabaseAnon
      .from('users')
      .select('id, supabase_id, email')
      .eq('supabase_id', `prisma-user-${clerkUserId}`)
      .single();
    
    if (error) {
      console.error('❌ User mapping failed:', error);
      return null;
    }
    
    console.log(`✅ Mapped Clerk user ${clerkUserId} to internal ID: ${data.id}`);
    return data.id;
    
  } catch (error) {
    console.error('❌ User mapping error:', error);
    return null;
  }
}

// Test task queries with proper user ID
export async function testTaskQueries(internalUserId: string) {
  console.log(`📋 Testing task queries for internal user ID: ${internalUserId}`);
  
  try {
    // Test light work tasks
    const { data: lightTasks, error: lightError } = await supabaseAnon
      .from('light_work_tasks')
      .select(`
        *,
        subtasks:light_work_subtasks(*)
      `)
      .eq('user_id', internalUserId)
      .eq('completed', false);
    
    if (lightError) {
      console.error('❌ Light work tasks query failed:', lightError);
    } else {
      console.log(`✅ Found ${lightTasks?.length || 0} light work tasks`);
    }
    
    // Test deep work tasks
    const { data: deepTasks, error: deepError } = await supabaseAnon
      .from('deep_work_tasks')
      .select(`
        *,
        subtasks:deep_work_subtasks(*)
      `)
      .eq('user_id', internalUserId)
      .eq('completed', false);
    
    if (deepError) {
      console.error('❌ Deep work tasks query failed:', deepError);
    } else {
      console.log(`✅ Found ${deepTasks?.length || 0} deep work tasks`);
    }
    
    return { lightTasks, deepTasks };
    
  } catch (error) {
    console.error('❌ Task queries failed:', error);
    return null;
  }
}