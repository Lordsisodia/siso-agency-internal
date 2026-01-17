#!/usr/bin/env node

/**
 * Setup Public User for Demo Mode
 *
 * This script creates a public user in Supabase that allows unauthenticated
 * access to the LifeLock daily page for testing and demo purposes.
 *
 * Usage: node scripts/migrations/setup-public-user.js
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

const PUBLIC_USER_ID = '00000000-0000-0000-0000-000000000000';
const PUBLIC_USER_EMAIL = 'public@demo.local';

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupPublicUser() {
  console.log('🔧 Setting up public user for demo mode...\n');

  try {
    // Check if public user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('id', PUBLIC_USER_ID)
      .maybeSingle();

    if (checkError) {
      console.error('❌ Error checking for public user:', checkError);
      process.exit(1);
    }

    if (existingUser) {
      console.log('✅ Public user already exists:');
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Name: ${existingUser.full_name}\n`);
      console.log('ℹ️  Skipping creation. User is ready for demo mode.\n');
      return;
    }

    // Create the public user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: PUBLIC_USER_ID,
        email: PUBLIC_USER_EMAIL,
        full_name: 'Public Demo User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error creating public user:', insertError);
      process.exit(1);
    }

    console.log('✅ Public user created successfully!');
    console.log(`   ID: ${newUser.id}`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Name: ${newUser.full_name}\n`);

    // Create a sample morning routine entry for today
    const { error: routineError } = await supabase
      .from('morning_routine_tasks')
      .insert({
        user_id: PUBLIC_USER_ID,
        date: new Date().toISOString().split('T')[0],
        wake_up_time: null,
        meditation_duration: null,
        freshen_up_completed: false,
        get_blood_flowing_completed: false,
        power_up_brain_completed: false,
        plan_day_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (routineError) {
      console.warn('⚠️  Warning: Could not create sample morning routine:', routineError.message);
    } else {
      console.log('✅ Sample morning routine entry created for today.\n');
    }

    console.log('🎉 Setup complete!');
    console.log('');
    console.log('The public user can now access LifeLock daily page without authentication.');
    console.log('All data created/modified by anonymous users will be stored under this ID.');
    console.log('');
    console.log('📝 To create or update RLS policies for public access, run:');
    console.log('   psql scripts/migrations/update-rls-for-public.sql');
    console.log('');
    console.log('🔗 Or execute manually in Supabase SQL Editor:\n');
    console.log('   UPDATE public.users SET id = \'00000000-0000-0000-0000-000000000000\';\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run the setup
setupPublicUser();
