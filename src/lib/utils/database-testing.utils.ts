/**
 * Database Testing Utilities
 * Comprehensive testing tools for Supabase database operations
 */

import { createClient } from '@supabase/supabase-js';
import { ChatThread, ChatMessage, MorningRoutineSession } from '../types/ai-chat.types';

export interface DatabaseTestResult {
  operation: string;
  success: boolean;
  duration: number;
  data?: any;
  error?: string;
}

/**
 * Create Supabase client for testing
 */
function createTestSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not found in environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Test basic database connection
 */
export async function testDatabaseConnection(): Promise<DatabaseTestResult> {
  const startTime = Date.now();
  
  try {
    const supabase = createTestSupabaseClient();
    
    // Simple query to test connection
    const { data, error } = await supabase
      .from('ai_chat_threads')
      .select('count')
      .limit(1);
    
    if (error) {
      return {
        operation: 'Database Connection',
        success: false,
        duration: Date.now() - startTime,
        error: error.message
      };
    }
    
    return {
      operation: 'Database Connection',
      success: true,
      duration: Date.now() - startTime,
      data: { 
        status: 'Connected successfully',
        queryResult: data
      }
    };
  } catch (error) {
    return {
      operation: 'Database Connection',
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Test chat thread CRUD operations
 */
export async function testChatThreadOperations(): Promise<DatabaseTestResult> {
  const startTime = Date.now();
  
  try {
    const supabase = createTestSupabaseClient();
    const testThreadId = `test_thread_${Date.now()}`;
    
    // Test INSERT
    const testThread = {
      id: testThreadId,
      title: 'Test Thread',
      mode: 'general',
      personality: 'helpful',
      message_count: 0,
      is_active: true,
      tags: ['test'],
      summary: null
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('ai_chat_threads')
      .insert([testThread])
      .select();
    
    if (insertError) {
      return {
        operation: 'Chat Thread CRUD',
        success: false,
        duration: Date.now() - startTime,
        error: `Insert failed: ${insertError.message}`
      };
    }
    
    // Test SELECT
    const { data: selectData, error: selectError } = await supabase
      .from('ai_chat_threads')
      .select('*')
      .eq('id', testThreadId)
      .single();
    
    if (selectError) {
      return {
        operation: 'Chat Thread CRUD',
        success: false,
        duration: Date.now() - startTime,
        error: `Select failed: ${selectError.message}`
      };
    }
    
    // Test UPDATE
    const { data: updateData, error: updateError } = await supabase
      .from('ai_chat_threads')
      .update({ title: 'Updated Test Thread', message_count: 1 })
      .eq('id', testThreadId)
      .select();
    
    if (updateError) {
      return {
        operation: 'Chat Thread CRUD',
        success: false,
        duration: Date.now() - startTime,
        error: `Update failed: ${updateError.message}`
      };
    }
    
    // Test DELETE (cleanup)
    const { error: deleteError } = await supabase
      .from('ai_chat_threads')
      .delete()
      .eq('id', testThreadId);
    
    if (deleteError) {
      return {
        operation: 'Chat Thread CRUD',
        success: false,
        duration: Date.now() - startTime,
        error: `Delete failed: ${deleteError.message}`
      };
    }
    
    return {
      operation: 'Chat Thread CRUD',
      success: true,
      duration: Date.now() - startTime,
      data: {
        operations: ['INSERT', 'SELECT', 'UPDATE', 'DELETE'],
        testThread: testThread,
        insertResult: insertData,
        selectResult: selectData,
        updateResult: updateData
      }
    };
  } catch (error) {
    return {
      operation: 'Chat Thread CRUD',
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Test chat message operations
 */
export async function testChatMessageOperations(): Promise<DatabaseTestResult> {
  const startTime = Date.now();
  
  try {
    const supabase = createTestSupabaseClient();
    const testThreadId = `test_thread_${Date.now()}`;
    const testMessageId = `test_msg_${Date.now()}`;
    
    // First create a test thread
    const testThread = {
      id: testThreadId,
      title: 'Test Thread for Messages',
      mode: 'general',
      personality: 'helpful',
      message_count: 0,
      is_active: true
    };
    
    const { error: threadError } = await supabase
      .from('ai_chat_threads')
      .insert([testThread]);
    
    if (threadError) {
      return {
        operation: 'Chat Message Operations',
        success: false,
        duration: Date.now() - startTime,
        error: `Thread creation failed: ${threadError.message}`
      };
    }
    
    // Test message insertion
    const testMessages = [
      {
        id: `${testMessageId}_1`,
        thread_id: testThreadId,
        role: 'user',
        content: 'Hello, this is a test message',
        metadata: { test: true }
      },
      {
        id: `${testMessageId}_2`,
        thread_id: testThreadId,
        role: 'assistant',
        content: 'Hello! I received your test message.',
        metadata: { test: true, response_time: 150 }
      }
    ];
    
    const { data: messageData, error: messageError } = await supabase
      .from('ai_chat_messages')
      .insert(testMessages)
      .select();
    
    if (messageError) {
      // Cleanup thread
      await supabase.from('ai_chat_threads').delete().eq('id', testThreadId);
      return {
        operation: 'Chat Message Operations',
        success: false,
        duration: Date.now() - startTime,
        error: `Message insert failed: ${messageError.message}`
      };
    }
    
    // Test message retrieval
    const { data: retrievedMessages, error: retrievalError } = await supabase
      .from('ai_chat_messages')
      .select('*')
      .eq('thread_id', testThreadId)
      .order('timestamp', { ascending: true });
    
    // Cleanup
    await supabase.from('ai_chat_messages').delete().eq('thread_id', testThreadId);
    await supabase.from('ai_chat_threads').delete().eq('id', testThreadId);
    
    if (retrievalError) {
      return {
        operation: 'Chat Message Operations',
        success: false,
        duration: Date.now() - startTime,
        error: `Message retrieval failed: ${retrievalError.message}`
      };
    }
    
    return {
      operation: 'Chat Message Operations',
      success: true,
      duration: Date.now() - startTime,
      data: {
        messagesInserted: testMessages.length,
        messagesRetrieved: retrievedMessages?.length || 0,
        testMessages: testMessages,
        retrievedMessages: retrievedMessages
      }
    };
  } catch (error) {
    return {
      operation: 'Chat Message Operations',
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Test morning routine session operations
 */
export async function testMorningRoutineOperations(): Promise<DatabaseTestResult> {
  const startTime = Date.now();
  
  try {
    const supabase = createTestSupabaseClient();
    const testSessionId = `test_session_${Date.now()}`;
    const testThreadId = `test_thread_${Date.now()}`;
    
    // Create test session
    const testSession = {
      id: testSessionId,
      thread_id: testThreadId,
      routine_type: '23-minute',
      start_time: new Date().toISOString(),
      end_time: null,
      status: 'active',
      tasks_created: 3,
      thoughts_processed: 5,
      metadata: {
        test: true,
        phases_completed: ['brain-dump', 'processing']
      }
    };
    
    // Test session creation
    const { data: sessionData, error: sessionError } = await supabase
      .from('ai_morning_routine_sessions')
      .insert([testSession])
      .select();
    
    if (sessionError) {
      return {
        operation: 'Morning Routine Operations',
        success: false,
        duration: Date.now() - startTime,
        error: `Session creation failed: ${sessionError.message}`
      };
    }
    
    // Test session completion
    const { data: completedSession, error: completionError } = await supabase
      .from('ai_morning_routine_sessions')
      .update({ 
        end_time: new Date().toISOString(),
        status: 'completed',
        tasks_created: 5,
        thoughts_processed: 8
      })
      .eq('id', testSessionId)
      .select();
    
    // Cleanup
    await supabase.from('ai_morning_routine_sessions').delete().eq('id', testSessionId);
    
    if (completionError) {
      return {
        operation: 'Morning Routine Operations',
        success: false,
        duration: Date.now() - startTime,
        error: `Session completion failed: ${completionError.message}`
      };
    }
    
    return {
      operation: 'Morning Routine Operations',
      success: true,
      duration: Date.now() - startTime,
      data: {
        sessionCreated: sessionData?.[0],
        sessionCompleted: completedSession?.[0],
        operations: ['CREATE', 'UPDATE', 'DELETE']
      }
    };
  } catch (error) {
    return {
      operation: 'Morning Routine Operations',
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Test conversation insights operations
 */
export async function testConversationInsightsOperations(): Promise<DatabaseTestResult> {
  const startTime = Date.now();
  
  try {
    const supabase = createTestSupabaseClient();
    const testInsightId = `test_insight_${Date.now()}`;
    const testThreadId = `test_thread_${Date.now()}`;
    
    // Create test insight
    const testInsight = {
      id: testInsightId,
      thread_id: testThreadId,
      type: 'pattern',
      title: 'Test Pattern Recognition',
      description: 'User shows consistent morning routine patterns',
      confidence: 0.85,
      metadata: {
        test: true,
        pattern_type: 'time_preference',
        data_points: 10
      }
    };
    
    // Test insight creation
    const { data: insightData, error: insightError } = await supabase
      .from('ai_conversation_insights')
      .insert([testInsight])
      .select();
    
    if (insightError) {
      return {
        operation: 'Conversation Insights Operations',
        success: false,
        duration: Date.now() - startTime,
        error: `Insight creation failed: ${insightError.message}`
      };
    }
    
    // Test insight retrieval by thread
    const { data: threadInsights, error: retrievalError } = await supabase
      .from('ai_conversation_insights')
      .select('*')
      .eq('thread_id', testThreadId);
    
    // Cleanup
    await supabase.from('ai_conversation_insights').delete().eq('id', testInsightId);
    
    if (retrievalError) {
      return {
        operation: 'Conversation Insights Operations',
        success: false,
        duration: Date.now() - startTime,
        error: `Insight retrieval failed: ${retrievalError.message}`
      };
    }
    
    return {
      operation: 'Conversation Insights Operations',
      success: true,
      duration: Date.now() - startTime,
      data: {
        insightCreated: insightData?.[0],
        insightsRetrieved: threadInsights?.length || 0,
        testInsight: testInsight
      }
    };
  } catch (error) {
    return {
      operation: 'Conversation Insights Operations',
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Test database schema and table existence
 */
export async function testDatabaseSchema(): Promise<DatabaseTestResult> {
  const startTime = Date.now();
  
  try {
    const supabase = createTestSupabaseClient();
    
    const requiredTables = [
      'ai_chat_threads',
      'ai_chat_messages',
      'ai_morning_routine_sessions',
      'ai_conversation_insights'
    ];
    
    const tableResults: Record<string, boolean> = {};
    
    for (const table of requiredTables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        tableResults[table] = !error;
      } catch (error) {
        tableResults[table] = false;
      }
    }
    
    const allTablesExist = Object.values(tableResults).every(exists => exists);
    
    return {
      operation: 'Database Schema',
      success: allTablesExist,
      duration: Date.now() - startTime,
      data: {
        requiredTables,
        tableResults,
        allTablesExist,
        missingTables: requiredTables.filter(table => !tableResults[table])
      }
    };
  } catch (error) {
    return {
      operation: 'Database Schema',
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Run all database tests
 */
export async function runAllDatabaseTests(): Promise<DatabaseTestResult[]> {
  console.log('🗄️ Running all database tests...');
  
  const tests = [
    testDatabaseConnection(),
    testDatabaseSchema(),
    testChatThreadOperations(),
    testChatMessageOperations(),
    testMorningRoutineOperations(),
    testConversationInsightsOperations()
  ];

  const results = await Promise.all(tests);
  
  // Log summary
  const successCount = results.filter(r => r.success).length;
  console.log(`✅ ${successCount}/${results.length} database tests passed`);
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.operation}: ${result.duration}ms`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  return results;
}

/**
 * Generate database setup SQL
 */
export function generateDatabaseSetupSQL(): string {
  return `
-- AI Chat Assistant Database Schema
-- Run this SQL in your Supabase SQL editor

-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- Chat Threads Table
CREATE TABLE IF NOT EXISTS ai_chat_threads (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'general',
  personality TEXT NOT NULL DEFAULT 'helpful',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  message_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  summary TEXT
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL REFERENCES ai_chat_threads(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  metadata JSONB DEFAULT '{}'
);

-- Morning Routine Sessions Table
CREATE TABLE IF NOT EXISTS ai_morning_routine_sessions (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL,
  routine_type TEXT NOT NULL DEFAULT '23-minute',
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  tasks_created INTEGER DEFAULT 0,
  thoughts_processed INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'
);

-- Conversation Insights Table
CREATE TABLE IF NOT EXISTS ai_conversation_insights (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence REAL NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_thread_id ON ai_chat_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_timestamp ON ai_chat_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_chat_threads_updated_at ON ai_chat_threads(updated_at);
CREATE INDEX IF NOT EXISTS idx_ai_morning_routine_sessions_start_time ON ai_morning_routine_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_ai_conversation_insights_thread_id ON ai_conversation_insights(thread_id);

-- Row Level Security Policies (adjust based on your auth requirements)
-- For now, allowing all operations (adjust for production)
ALTER TABLE ai_chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_morning_routine_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversation_insights ENABLE ROW LEVEL SECURITY;

-- Basic policies (modify based on your authentication setup)
CREATE POLICY "Allow all operations on ai_chat_threads" ON ai_chat_threads FOR ALL USING (true);
CREATE POLICY "Allow all operations on ai_chat_messages" ON ai_chat_messages FOR ALL USING (true);
CREATE POLICY "Allow all operations on ai_morning_routine_sessions" ON ai_morning_routine_sessions FOR ALL USING (true);
CREATE POLICY "Allow all operations on ai_conversation_insights" ON ai_conversation_insights FOR ALL USING (true);
`;
}