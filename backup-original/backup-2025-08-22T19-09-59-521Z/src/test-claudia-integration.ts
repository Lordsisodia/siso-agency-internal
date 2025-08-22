/**
 * Test file to verify Claudia integration
 * Run this in the browser console to test the integration
 */

import { claudiaService } from './services/claudiaIntegrationService';

export async function testClaudiaIntegration() {
  console.log('🧪 Testing Claudia Integration...');
  
  try {
    // Test 1: Check if Claudia is available
    console.log('📋 Test 1: Checking Claudia availability...');
    const isAvailable = await claudiaService.isClaudiaAvailable();
    console.log(`✅ Claudia available: ${isAvailable}`);
    
    // Test 2: Get integration status
    console.log('📋 Test 2: Getting integration status...');
    const status = claudiaService.getIntegrationStatus();
    console.log('✅ Integration status:', status);
    
    // Test 3: Load agents
    console.log('📋 Test 3: Loading agents...');
    const agents = await claudiaService.getAgents();
    console.log(`✅ Loaded ${agents.length} agents:`, agents);
    
    // Test 4: Load projects
    console.log('📋 Test 4: Loading projects...');
    const projects = await claudiaService.getProjects();
    console.log(`✅ Loaded ${projects.length} projects:`, projects);
    
    // Test 5: Test agent execution (mock)
    if (agents.length > 0) {
      console.log('📋 Test 5: Testing agent execution...');
      const firstAgent = agents[0];
      const result = await claudiaService.executeAgent(firstAgent.id, 'Test task execution');
      console.log(`✅ Agent execution result: ${result}`);
    }
    
    console.log('🎉 All tests completed successfully!');
    return {
      success: true,
      results: {
        available: isAvailable,
        status,
        agentCount: agents.length,
        projectCount: projects.length
      }
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Auto-run test when loaded in development
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  console.log('🚀 Claudia Integration Test available. Run testClaudiaIntegration() to test.');
}