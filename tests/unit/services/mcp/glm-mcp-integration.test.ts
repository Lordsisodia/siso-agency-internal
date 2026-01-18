import { describe, it, expect, beforeAll } from 'vitest';
import { GLMMCPClient } from '../glm-client';

describe('GLMMCPClient Integration Tests', () => {
  let glmClient: GLMMCPClient;

  beforeAll(() => {
    // Only run integration tests if API key is available
    if (!process.env.GLM_API_KEY || process.env.GLM_API_KEY === 'test-api-key') {
      throw new Error('GLM_API_KEY must be set with a real API key for integration tests');
    }

    glmClient = new GLMMCPClient();
  });

  describe('chat', () => {
    it('should send chat completion request and receive response', async () => {
      const messages = [
        { role: 'user' as const, content: 'Say "Hello, GLM!"' }
      ];

      const result = await glmClient.chat({ messages });

      expect(result).toBeDefined();
      expect(result.choices).toBeDefined();
      expect(result.choices.length).toBeGreaterThan(0);
      expect(result.choices[0].message).toBeDefined();
      expect(result.choices[0].message.content).toBeDefined();
    }, 30000);
  });

  describe('manageTasks', () => {
    it('should provide task management assistance', async () => {
      const result = await glmClient.manageTasks({
        query: 'I have 3 tasks: complete project proposal, review code, and attend team meeting. How should I prioritize them?'
      });

      expect(result).toBeDefined();
      expect(result.analysis).toBeDefined();
      expect(result.suggestions).toBeInstanceOf(Array);
    }, 30000);

    it('should include context in task analysis', async () => {
      const result = await glmClient.manageTasks({
        query: 'Help me organize my tasks',
        context: {
          currentTasks: [
            { id: '1', title: 'Complete project proposal', status: 'in-progress' },
            { id: '2', title: 'Review PR', status: 'pending' }
          ],
          domain: 'lifelock'
        }
      });

      expect(result).toBeDefined();
      expect(result.analysis).toBeDefined();
    }, 30000);
  });

  describe('analyzeCode', () => {
    it('should analyze code and provide feedback', async () => {
      const result = await glmClient.analyzeCode({
        code: 'function processTasks(tasks) { return tasks.map(t => ({ ...t, processed: true })); }',
        language: 'typescript'
      });

      expect(result).toBeDefined();
      expect(result.analysis).toBeDefined();
      expect(result.suggestions).toBeInstanceOf(Array);
    }, 30000);

    it('should answer specific code questions', async () => {
      const result = await glmClient.analyzeCode({
        code: 'const x = 1;',
        question: 'How can I improve this code?'
      });

      expect(result).toBeDefined();
      expect(result.analysis).toBeDefined();
    }, 30000);
  });

  describe('optimizeWorkflow', () => {
    it('should optimize workflow steps', async () => {
      const result = await glmClient.optimizeWorkflow({
        workflowDescription: 'Daily morning routine',
        currentSteps: [
          'Wake up at 6am',
          'Check email',
          'Exercise',
          'Shower',
          'Breakfast',
          'Start work'
        ],
        goals: ['Reduce decision fatigue', 'Increase energy levels']
      });

      expect(result).toBeDefined();
      expect(result.optimizedSteps).toBeDefined();
      expect(result.explanation).toBeDefined();
      expect(result.improvements).toBeInstanceOf(Array);
    }, 30000);
  });

  describe('assist', () => {
    it('should provide general AI assistance', async () => {
      const result = await glmClient.assist({
        query: 'Give me 3 quick tips for staying focused'
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    }, 30000);

    it('should include context in assistance', async () => {
      const result = await glmClient.assist({
        query: 'How can I improve my routine?',
        context: {
          currentRoutine: ['Wake up', 'Check email', 'Start work'],
          goal: 'Increase morning productivity'
        }
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    }, 30000);
  });

  describe('chatStream', () => {
    it('should handle streaming responses', async () => {
      const chunks: string[] = [];

      await glmClient.chatStream(
        {
          messages: [
            { role: 'user' as const, content: 'Count from 1 to 5' }
          ]
        },
        (chunk) => {
          chunks.push(chunk);
        }
      );

      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks.join('')).toBeDefined();
    }, 30000);
  });
});
