/**
 * 🌱 Seed Data Service
 * 
 * Creates sample tasks and data for testing the AI XP system
 */

import { apiClient } from '@/services/api-client';

export interface CreateTaskInput {
  title: string;
  description?: string;
  workType: 'DEEP' | 'LIGHT' | 'MORNING';
  priority: 'CRITICAL' | 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  currentDate: string;
  originalDate?: string;
  timeEstimate?: string;
  estimatedDuration?: number;
  subtasks?: Array<{
    title: string;
    workType: 'DEEP' | 'LIGHT' | 'MORNING';
  }>;
}

export async function seedSampleTasks(userId: string, date: string) {
  const sampleTasks: CreateTaskInput[] = [
    {
      title: 'Review and respond to emails',
      description: 'Check priority inbox and reply to important emails',
      workType: 'LIGHT',
      priority: 'MEDIUM',
      currentDate: date,
      timeEstimate: '15 min',
      estimatedDuration: 15,
      subtasks: [
        { title: 'Check priority inbox', workType: 'LIGHT' },
        { title: 'Reply to client emails', workType: 'LIGHT' },
        { title: 'Archive processed emails', workType: 'LIGHT' }
      ]
    },
    {
      title: 'Update project documentation',
      description: 'Improve README and add API documentation',
      workType: 'LIGHT',
      priority: 'HIGH',
      currentDate: date,
      timeEstimate: '45 min',
      estimatedDuration: 45,
      subtasks: [
        { title: 'Update README file', workType: 'LIGHT' },
        { title: 'Add API documentation', workType: 'LIGHT' },
        { title: 'Review documentation for clarity', workType: 'LIGHT' }
      ]
    },
    {
      title: 'Schedule team check-in meetings',
      description: 'Coordinate weekly team meetings and send calendar invites',
      workType: 'LIGHT',
      priority: 'MEDIUM',
      currentDate: date,
      timeEstimate: '20 min',
      estimatedDuration: 20,
      subtasks: [
        { title: 'Check team availability', workType: 'LIGHT' },
        { title: 'Send calendar invites', workType: 'LIGHT' }
      ]
    },
    {
      title: 'Organize workspace and files',
      description: 'Clean up desktop and organize project files',
      workType: 'LIGHT',
      priority: 'LOW',
      currentDate: date,
      timeEstimate: '30 min',
      estimatedDuration: 30,
      subtasks: [
        { title: 'Clean up desktop files', workType: 'LIGHT' },
        { title: 'Organize project folders', workType: 'LIGHT' },
        { title: 'Archive old files', workType: 'LIGHT' }
      ]
    },
    {
      title: 'Research AI integration patterns',
      description: 'Study best practices for AI-powered task management',
      workType: 'LIGHT',
      priority: 'HIGH',
      currentDate: date,
      timeEstimate: '1 hour',
      estimatedDuration: 60,
      subtasks: [
        { title: 'Review AI integration documentation', workType: 'LIGHT' },
        { title: 'Study competitor implementations', workType: 'LIGHT' },
        { title: 'Document key findings', workType: 'LIGHT' }
      ]
    }
  ];

  console.log(`🌱 Seeding ${sampleTasks.length} sample tasks for ${date}...`);

  try {
    const createdTasks = [];
    for (const taskData of sampleTasks) {
      const task = await apiClient.createTask(userId, {
        ...taskData,
        originalDate: taskData.originalDate || taskData.currentDate
      });
      createdTasks.push(task);
    }

    console.log(`✅ Successfully seeded ${createdTasks.length} tasks`);
    return createdTasks;
  } catch (error) {
    console.error('❌ Failed to seed sample tasks:', error);
    throw error;
  }
}

export async function seedPersonalContext(userId: string) {
  const defaultContext = {
    currentGoals: "Building and scaling SISO-INTERNAL task management system",
    skillPriorities: "AI integration, full-stack development, system optimization",
    revenueTargets: "Growing business through efficient product development",
    timeConstraints: "High efficiency focus, minimal time waste",
    currentProjects: "SISO-INTERNAL, Claude Code integration, AI-powered features",
    hatedTasks: "Meetings, emails, repetitive admin work",
    valuedTasks: "Feature development, system architecture, AI implementation",
    learningObjectives: "Advanced AI integration, performance optimization, user experience"
  };

  try {
    await apiClient.updatePersonalContext(userId, defaultContext);
    console.log('✅ Successfully seeded personal context');
    return defaultContext;
  } catch (error) {
    console.error('❌ Failed to seed personal context:', error);
    throw error;
  }
}