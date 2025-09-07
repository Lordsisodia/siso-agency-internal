/**
 * 🧪 Database Test Endpoint
 * 
 * Test Supabase connection and check available tables
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://avdgyrepwrvsvwgxrccr.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2ZGd5cmVwd3J2c3Z3Z3hyY2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MzgwODIsImV4cCI6MjA1OTIxNDA4Mn0.8MZ2etAhQ1pTJnK84uoqAFfUirv_kaoYcmKHhKgLAWU';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: any, res: any) {
  try {
    // Test basic connection
    console.log('🧪 Testing Supabase connection...');
    
    // Try to query some common tables to see what exists
    const tablesToTest = ['users', 'daily_routines', 'tasks', 'profiles'];
    const results: any = {};
    
    for (const table of tablesToTest) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          results[table] = { error: error.message };
        } else {
          results[table] = { exists: true, sampleCount: data?.length || 0 };
        }
      } catch (err) {
        results[table] = { error: 'Connection failed' };
      }
    }
    
    return res.status(200).json({
      success: true,
      supabaseUrl,
      tables: results
    });
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}