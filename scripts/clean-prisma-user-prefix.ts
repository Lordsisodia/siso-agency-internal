/**
 * Clean Prisma User Prefix - One-Time Migration Script
 * 
 * Removes legacy "prisma-user-" prefix from all user records
 * Run with: npx tsx scripts/clean-prisma-user-prefix.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://avdgyrepwrvsvwgxrccr.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2ZGd5cmVwd3J2c3Z3Z3hyY2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MzgwODIsImV4cCI6MjA1OTIxNDA4Mn0.8MZ2etAhQ1pTJnK84uoqAFfUirv_kaoYcmKHhKgLAWU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function cleanPrismaPrefix() {
  console.log('🧹 Starting Prisma Prefix Cleanup');
  console.log('=================================\n');

  try {
    // Step 1: Find all users with prisma-user- prefix
    console.log('📊 Step 1: Finding users with prisma-user- prefix...');
    const { data: users, error } = await supabase
      .from('users')
      .select('id, supabase_id, email')
      .like('supabase_id', 'prisma-user-%');

    if (error) {
      console.error('❌ Error fetching users:', error);
      return;
    }

    if (!users || users.length === 0) {
      console.log('✅ No users with prisma-user- prefix found. Database is clean!');
      return;
    }

    console.log(`\n⚠️  Found ${users.length} users with legacy prefix:\n`);
    users.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.email || 'no-email'}`);
      console.log(`      OLD: ${user.supabase_id}`);
      console.log(`      NEW: ${user.supabase_id.replace('prisma-user-', '')}\n`);
    });

    // Step 2: Confirm before proceeding
    console.log('🔄 Step 2: Updating user records...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      const cleanId = user.supabase_id.replace('prisma-user-', '');
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ supabase_id: cleanId })
        .eq('id', user.id);

      if (updateError) {
        console.error(`   ❌ Failed to update ${user.email}:`, updateError.message);
        errorCount++;
      } else {
        console.log(`   ✅ Updated ${user.email}: ${user.supabase_id} → ${cleanId}`);
        successCount++;
      }
    }

    console.log('\n📈 Migration Summary');
    console.log('===================');
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log(`   📊 Total: ${users.length}\n`);

    // Step 3: Verify cleanup
    console.log('🔍 Step 3: Verifying cleanup...');
    const { data: remaining, error: verifyError } = await supabase
      .from('users')
      .select('id')
      .like('supabase_id', 'prisma-user-%');

    if (verifyError) {
      console.error('❌ Verification error:', verifyError);
      return;
    }

    if (remaining && remaining.length > 0) {
      console.log(`⚠️  Still ${remaining.length} users with prefix. Review errors above.`);
    } else {
      console.log('✅ All users successfully cleaned!\n');
      console.log('🎉 Migration Complete!');
      console.log('=====================');
      console.log('Next steps:');
      console.log('  1. Update useSupabaseUserId hook to remove prefix');
      console.log('  2. Test authentication and data loading');
      console.log('  3. Remove this migration script after verification');
    }

  } catch (err) {
    console.error('❌ Migration failed:', err);
  }
}

cleanPrismaPrefix().catch(console.error);
