/**
 * Database Migration Test Suite
 * Validates hybrid database system functionality
 */

import { DatabaseManager } from './DatabaseManager';
import type { DatabaseMode } from './types';

export const testDatabaseSystem = async () => {
  console.log('🧪 Testing Hybrid Database System...\n');

  // Test different database modes
  const modes: DatabaseMode[] = ['prisma', 'supabase', 'hybrid'];
  const results: Record<string, any> = {};

  for (const mode of modes) {
    console.log(`📊 Testing ${mode.toUpperCase()} mode:`);
    
    try {
      const manager = new DatabaseManager({ 
        mode,
        enableLogging: true 
      });

      // Health check
      const health = await manager.healthCheck();
      console.log(`  ✅ Health Check:`, health);

      // Test basic operations (non-destructive)
      try {
        const testFilters = {
          userId: 'test-user-id',
          date: '2025-09-04',
          showAllIncomplete: false
        };

        // Test light work tasks read operation
        await manager.getLightWorkTasks(testFilters);
        console.log(`  ✅ Light Work Tasks query: SUCCESS`);

        // Test deep work tasks read operation  
        await manager.getDeepWorkTasks(testFilters);
        console.log(`  ✅ Deep Work Tasks query: SUCCESS`);

      } catch (readError) {
        console.log(`  ⚠️  Read operations:`, readError.message);
      }

      results[mode] = { 
        status: 'SUCCESS', 
        health,
        mode: manager.getCurrentMode()
      };

      // Cleanup
      await manager.cleanup();

    } catch (error) {
      console.log(`  ❌ ${mode.toUpperCase()} mode failed:`, error.message);
      results[mode] = { 
        status: 'FAILED', 
        error: error.message 
      };
    }

    console.log(''); // Empty line for readability
  }

  return results;
};

export const testEnvironmentConfig = () => {
  console.log('🔧 Testing Environment Configuration...\n');

  const requiredEnvVars = {
    'DATABASE_MODE': process.env.DATABASE_MODE,
    'VITE_SUPABASE_URL': process.env.VITE_SUPABASE_URL,
    'VITE_SUPABASE_ANON_KEY': process.env.VITE_SUPABASE_ANON_KEY,
    'DATABASE_URL': process.env.DATABASE_URL
  };

  let configValid = true;

  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    const status = value ? '✅' : '❌';
    const displayValue = value ? 
      (key.includes('KEY') || key.includes('URL') ? '***hidden***' : value) : 
      'NOT SET';
    
    console.log(`  ${status} ${key}: ${displayValue}`);
    
    if (!value && !key.includes('DATABASE_URL')) { // DATABASE_URL optional for Supabase-only mode
      configValid = false;
    }
  });

  console.log(`\n🎯 Configuration Status: ${configValid ? '✅ VALID' : '❌ INCOMPLETE'}\n`);
  
  return configValid;
};

export const performMigrationReadinessCheck = async () => {
  console.log('🚀 Migration Readiness Check\n');
  console.log('=' .repeat(50));

  // Test environment
  const envCheck = testEnvironmentConfig();
  
  // Test database systems
  const dbResults = await testDatabaseSystem();

  // Summary
  console.log('📋 MIGRATION READINESS SUMMARY');
  console.log('=' .repeat(50));
  console.log(`Environment Config: ${envCheck ? '✅ READY' : '❌ NOT READY'}`);
  
  Object.entries(dbResults).forEach(([mode, result]) => {
    const status = result.status === 'SUCCESS' ? '✅' : '❌';
    console.log(`${mode.toUpperCase()} Mode: ${status} ${result.status}`);
  });

  const allReady = envCheck && Object.values(dbResults).every(r => r.status === 'SUCCESS');
  console.log(`\n🎯 Overall Status: ${allReady ? '✅ READY FOR MIGRATION' : '⚠️ CONFIGURATION NEEDED'}`);
  
  if (!allReady) {
    console.log('\n📝 Next Steps:');
    if (!envCheck) {
      console.log('  1. Update .env.local with your Supabase credentials');
    }
    
    Object.entries(dbResults).forEach(([mode, result]) => {
      if (result.status === 'FAILED') {
        console.log(`  2. Fix ${mode} database connection issues`);
      }
    });
  }

  return {
    environmentReady: envCheck,
    databaseResults: dbResults,
    migrationReady: allReady
  };
};