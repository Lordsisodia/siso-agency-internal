/**
 * 🌟 SISO Light Work Plan - Modular Architecture V2
 * 
 * MIGRATED: Now uses TaskContainerV2 with the new decomposed architecture.
 * Benefits: React Query optimistic updates, enhanced validation, better performance.
 * Maintains identical UI/UX while providing enhanced functionality.
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import { TaskContainerV2 } from "../tasks/TaskContainerV2";
import { Task } from "../tasks/TaskCard";

// Light Work focused tasks - optimized for shorter, flexible tasks
const lightWorkTasks: Task[] = [
  {
    id: "lw1",
    title: "Quick admin and email processing",
    description: "Handle incoming emails, admin tasks, and quick communications",
    status: "in-progress",
    priority: "medium",
    level: 0,
    dependencies: [],
    focusIntensity: 1,
    context: "admin",
    subtasks: [
      {
        id: "lw1.1",
        title: "Process inbox and respond to urgent emails",
        description: "Clear high-priority emails and set up follow-ups",
        status: "in-progress",
        priority: "high",
        estimatedTime: "20min",
        tools: ["email-client", "task-tracker", "calendar"],
      },
      {
        id: "lw1.2",
        title: "Update project status reports",
        description: "Quick status updates for ongoing projects",
        status: "pending",
        priority: "medium",
        estimatedTime: "15min",
        tools: ["project-manager", "status-tracker", "reporting-tool"],
      },
      {
        id: "lw1.3",
        title: "Schedule upcoming meetings and calls",
        description: "Coordinate calendars and send meeting invites",
        status: "pending",
        priority: "medium",
        estimatedTime: "10min",
        tools: ["calendar", "meeting-scheduler", "email-client"],
      },
    ],
  },
  {
    id: "lw2",
    title: "Content review and social media",
    description: "Review content drafts, social media updates, and marketing materials",
    status: "pending",
    priority: "medium",
    level: 0,
    dependencies: [],
    focusIntensity: 2,
    context: "content",
    subtasks: [
      {
        id: "lw2.1",
        title: "Review blog post drafts",
        description: "Edit and approve pending blog content",
        status: "pending",
        priority: "medium",
        estimatedTime: "25min",
        tools: ["content-editor", "grammar-checker", "cms"],
      },
      {
        id: "lw2.2",
        title: "Schedule social media posts",
        description: "Queue up social media content for the week",
        status: "pending",
        priority: "low",
        estimatedTime: "15min",
        tools: ["social-scheduler", "content-library", "analytics"],
      },
      {
        id: "lw2.3",
        title: "Update website copy",
        description: "Minor updates to website content and landing pages",
        status: "pending",
        priority: "low",
        estimatedTime: "20min",
        tools: ["cms", "web-editor", "analytics"],
      },
    ],
  },
  {
    id: "lw3",
    title: "Research and quick learning sessions",
    description: "Light research, learning, and information gathering tasks",
    status: "pending",
    priority: "low",
    level: 1,
    dependencies: ["lw1"],
    focusIntensity: 2,
    context: "learning",
    subtasks: [
      {
        id: "lw3.1",
        title: "Industry trend research",
        description: "Quick scan of industry news and trends",
        status: "pending",
        priority: "low",
        estimatedTime: "20min",
        tools: ["news-aggregator", "research-tool", "note-taker"],
      },
      {
        id: "lw3.2",
        title: "Competitive analysis update",
        description: "Check competitor updates and market position",
        status: "pending",
        priority: "low",
        estimatedTime: "15min",
        tools: ["competitor-tracker", "analytics", "research-tool"],
      },
      {
        id: "lw3.3",
        title: "Learn new tool or technique",
        description: "Quick tutorial or documentation reading",
        status: "pending",
        priority: "medium",
        estimatedTime: "30min",
        tools: ["learning-platform", "documentation", "practice-environment"],
      },
    ],
  },
  {
    id: "lw4",
    title: "Quick wins and optimizations",
    description: "Small improvements and optimizations that provide quick wins",
    status: "pending",
    priority: "high",
    level: 1,
    dependencies: [],
    focusIntensity: 1,
    context: "optimization",
    subtasks: [
      {
        id: "lw4.1",
        title: "Optimize workflow automation",
        description: "Fine-tune existing automations for better efficiency",
        status: "pending",
        priority: "high",
        estimatedTime: "25min",
        tools: ["automation-tool", "workflow-manager", "testing-suite"],
      },
      {
        id: "lw4.2",
        title: "Clean up digital workspace",
        description: "Organize files, clean desktop, update bookmarks",
        status: "pending",
        priority: "medium",
        estimatedTime: "15min",
        tools: ["file-manager", "bookmark-manager", "cleanup-tool"],
      },
    ],
  },
];

interface SisoLightWorkPlanProps {
  onStartFocusSession?: (taskId: string, intensity: number) => void;
}

export default function SisoLightWorkPlan({ onStartFocusSession }: SisoLightWorkPlanProps) {
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
        🌟 Light Work Architecture V2 Benefits:
        - TaskContainerV2 with React Query optimistic updates
        - Enhanced validation for light-work task types
        - Automatic data loading (no initialTasks needed)
        - Better error handling and recovery
        - All CRUD operations with instant UI feedback
        - Modular hooks architecture for easier testing
      */}
      <TaskContainerV2
        taskType="light-work"
        onStartFocusSession={onStartFocusSession}
        className="px-2"
        showHeader={true}
        showSearch={true}
        showFilters={true}
        showBulkActions={true}
      />
    </motion.div>
  );
}

// Export the component for testing
export { SisoLightWorkPlan };