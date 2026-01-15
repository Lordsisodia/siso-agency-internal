/**
 * GLM MCP Client - Quick Start Example
 *
 * This file demonstrates how to use the GLM MCP client in SISO Internal.
 *
 * SETUP:
 * 1. Set your GLM API key in .env:
 *    GLM_API_KEY=your_api_key_here
 *
 * 2. Run this example:
 *    npx tsx src/services/mcp/glm-example.ts
 */

import { GLMMCPClient } from './glm-client';
import { initializeMCPServices } from './index';

async function directClientExample() {
  console.log('\n=== Direct GLM Client Usage ===\n');

  const glm = new GLMMCPClient();

  // Example 1: General assistance
  console.log('1. Getting advice on productivity...');
  const advice = await glm.assist({
    query: 'Give me 3 quick tips for staying focused during deep work sessions'
  });
  console.log('Response:', advice);
  console.log('\n---\n');

  // Example 2: Task management
  console.log('2. Getting task management help...');
  const taskHelp = await glm.manageTasks({
    query: 'How should I prioritize these tasks?',
    context: {
      currentTasks: [
        { id: '1', title: 'Complete project proposal', status: 'in-progress' },
        { id: '2', title: 'Review pull requests', status: 'pending' },
        { id: '3', title: 'Team standup meeting', status: 'scheduled' }
      ],
      recentActivity: ['Completed morning routine', 'Started deep work session'],
      domain: 'lifelock'
    }
  });
  console.log('Analysis:', taskHelp.analysis);
  console.log('Suggestions:', taskHelp.suggestions);
  console.log('\n---\n');

  // Example 3: Code analysis
  console.log('3. Analyzing code...');
  const codeAnalysis = await glm.analyzeCode({
    code: `
function processTasks(tasks) {
  return tasks.map(t => ({ ...t, processed: true }));
}
    `,
    language: 'typescript',
    question: 'How can I improve this function?'
  });
  console.log('Analysis:', codeAnalysis.analysis);
  console.log('\n---\n');

  // Example 4: Workflow optimization
  console.log('4. Optimizing workflow...');
  const optimized = await glm.optimizeWorkflow({
    workflowDescription: 'Morning routine',
    currentSteps: [
      'Wake up at 6am',
      'Check email',
      'Exercise',
      'Shower',
      'Breakfast'
    ],
    goals: ['Increase morning energy', 'Start deep work earlier']
  });
  console.log('Optimized Steps:', optimized.optimizedSteps);
  console.log('Explanation:', optimized.explanation);
  console.log('\n---\n');
}

async function mcpOrchestratorExample() {
  console.log('\n=== Using GLM via MCP Orchestrator ===\n');

  const { orchestrator } = initializeMCPServices();

  // GLM is already registered - execute a workflow
  const result = await orchestrator.executeWorkflow({
    id: 'task-analysis-workflow',
    name: 'AI-Powered Task Analysis',
    steps: [
      {
        id: 'analyze-tasks',
        mcp: 'glm',
        action: 'manageTasks',
        params: {
          query: 'Help me organize and prioritize my SISO tasks',
          context: {
            currentTasks: [
              { id: '1', title: 'Deep work session', status: 'pending' },
              { id: '2', title: 'Light work tasks', status: 'in-progress' },
              { id: '3', title: 'Morning routine', status: 'completed' }
            ]
          }
        }
      }
    ]
  });

  console.log('Workflow Status:', result.status);
  console.log('Step Result:', result.results[0].result);
  console.log('\n---\n');
}

async function unifiedMCPClientExample() {
  console.log('\n=== Using GLM via Unified MCP Client (Smart Routing) ===\n');

  const { client } = initializeMCPServices();

  // The unified client will automatically route this to GLM
  const response = await client.smartQuery(
    'Help me prioritize my tasks for today. I have deep work, light work, and a morning routine to complete.',
    {
      currentTasks: [
        { id: '1', title: 'Deep work: Project proposal', status: 'pending' },
        { id: '2', title: 'Light work: Email responses', status: 'pending' },
        { id: '3', title: 'Morning routine', status: 'in-progress' }
      ]
    }
  );

  console.log('Intent detected: Task management → GLM');
  console.log('Response:', response);
  console.log('\n---\n');
}

async function streamingExample() {
  console.log('\n=== Streaming Chat Example ===\n');

  const glm = new GLMMCPClient();

  console.log('Streaming response for "What is the pomodoro technique?":\n');

  await glm.chatStream(
    {
      messages: [
        { role: 'user', content: 'Explain the pomodoro technique in 3 sentences' }
      ]
    },
    (chunk) => {
      process.stdout.write(chunk);
    }
  );

  console.log('\n\n---\n');
}

async function main() {
  try {
    // Check if API key is set
    if (!process.env.GLM_API_KEY) {
      console.error('❌ GLM_API_KEY environment variable is not set');
      console.log('\nTo get started:');
      console.log('1. Get your API key from: https://open.bigmodel.cn/');
      console.log("2. Add it to your .env file: GLM_API_KEY=your_key_here");
      process.exit(1);
    }

    console.log('🚀 GLM MCP Client Examples\n');

    await directClientExample();
    await mcpOrchestratorExample();
    await unifiedMCPClientExample();
    await streamingExample();

    console.log('\n✅ All examples completed successfully!\n');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  main();
}

export {
  directClientExample,
  mcpOrchestratorExample,
  unifiedMCPClientExample,
  streamingExample
};
