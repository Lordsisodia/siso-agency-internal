/**
 * 🎯 SISO Deep Focus Plan - Enhanced v2
 * 
 * Refactored to use the new reusable TaskContainer architecture.
 * Preserves all original functionality while enabling component reuse.
 * Based on working HOTFIX implementation with full CRUD operations.
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import { TaskContainer } from "../tasks/TaskContainer";
import { Task } from "../tasks/TaskCard";

// SISO IDE focused tasks - cleaned up for new architecture
const sisoTasks: Task[] = [
  {
    id: "1",
    title: "Get the SISO IDE fully functioning",
    description: "Complete development and optimization of the SISO Internal IDE platform",
    status: "in-progress",
    priority: "high",
    level: 0,
    dependencies: [],
    focusIntensity: 3,
    context: "coding",
    subtasks: [
      {
        id: "1.1",
        title: "Fix console errors and ReferenceError issues",
        description: "Resolve JavaScript errors preventing proper IDE functionality",
        status: "in-progress",
        priority: "high",
        estimatedTime: "45min",
        tools: ["browser-devtools", "error-debugger", "code-assistant"],
      },
      {
        id: "1.2",
        title: "Complete Prisma database integration testing",
        description: "Ensure all database operations work seamlessly with zero cold starts",
        status: "pending",
        priority: "high", 
        estimatedTime: "60min",
        tools: ["prisma-client", "database-tester", "performance-monitor"],
      },
      {
        id: "1.3",
        title: "Optimize bundle size and loading performance",
        description: "Reduce application load times and improve overall performance",
        status: "pending",
        priority: "medium",
        estimatedTime: "90min",
        tools: ["webpack-analyzer", "performance-profiler", "code-splitter"],
      },
      {
        id: "1.4",
        title: "Enhance mobile responsiveness",
        description: "Improve mobile UX and responsive design across all components",
        status: "pending",
        priority: "medium",
        estimatedTime: "75min",
        tools: ["responsive-tester", "mobile-debugger", "css-optimizer"],
      },
      {
        id: "1.5",
        title: "Complete missing daily tracking features",
        description: "Implement all planned life management and tracking functionality",
        status: "pending",
        priority: "high",
        estimatedTime: "120min",
        tools: ["react-components", "state-manager", "ui-builder"],
      },
    ],
  },
  {
    id: "2",
    title: "Implement advanced flow state tracking",
    description: "Build sophisticated productivity and deep work monitoring system",
    status: "pending",
    priority: "high",
    level: 0,
    dependencies: [],
    focusIntensity: 4,
    context: "coding",
    subtasks: [
      {
        id: "2.1",
        title: "Build real-time focus quality metrics",
        description: "Create system to track and measure focus quality during work sessions",
        status: "pending",
        priority: "high",
        estimatedTime: "90min",
        tools: ["analytics-engine", "metrics-collector", "real-time-tracker"],
      },
      {
        id: "2.2",
        title: "Implement context switching penalty calculations",
        description: "Develop algorithms to calculate productivity loss from task switching",
        status: "pending",
        priority: "medium",
        estimatedTime: "60min",
        tools: ["algorithm-designer", "calculation-engine", "data-processor"],
      },
      {
        id: "2.3",
        title: "Create intelligent break suggestions",
        description: "Build AI system to suggest optimal break timing based on work patterns",
        status: "pending",
        priority: "medium",
        estimatedTime: "75min",
        tools: ["ai-assistant", "pattern-analyzer", "notification-system"],
      },
    ],
  },
  {
    id: "3",
    title: "Enhance task management system",
    description: "Improve the clean, hierarchical task organization and tracking",
    status: "pending",
    priority: "medium",
    level: 1,
    dependencies: ["1"],
    focusIntensity: 2,
    context: "design",
    subtasks: [
      {
        id: "3.1",
        title: "Implement drag-and-drop task reordering",
        description: "Add intuitive drag-and-drop functionality for task organization",
        status: "pending",
        priority: "medium",
        estimatedTime: "45min",
        tools: ["dnd-library", "animation-engine", "gesture-handler"],
      },
      {
        id: "3.2",
        title: "Add task dependency visualization",
        description: "Create visual representation of task dependencies and blockers",
        status: "pending",
        priority: "low",
        estimatedTime: "60min",
        tools: ["graph-visualizer", "dependency-mapper", "svg-renderer"],
      },
      {
        id: "3.3",
        title: "Build task templates and quick actions",
        description: "Create reusable task templates and quick action shortcuts",
        status: "pending",
        priority: "low",
        estimatedTime: "30min",
        tools: ["template-engine", "shortcuts-manager", "quick-actions"],
      },
    ],
  },
];

interface SisoDeepFocusPlanProps {
  onStartFocusSession?: (taskId: string, intensity: number) => void;
}

export default function SisoDeepFocusPlanV2({ onStartFocusSession }: SisoDeepFocusPlanProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.3, ease: [0.2, 0.65, 0.3, 0.9] }
      }}
      className="h-full"
    >
      {/* 
        🎯 New Architecture Benefits:
        - All state management handled by TaskContainer
        - Full CRUD operations (add, edit, delete tasks & subtasks)
        - Reusable across Deep Work, Light Work, and other pages
        - Clean separation of concerns
        - Preserved beautiful animations and UI
      */}
      <TaskContainer
        initialTasks={sisoTasks}
        theme="deep-work"
        onStartFocusSession={onStartFocusSession}
        className="px-2"
        useDatabase={true}
        workType="deep_work"
      />
    </motion.div>
  );
}

// Export the new component as the default for testing
export { SisoDeepFocusPlanV2 };