"use client";

import React from "react";
import { X, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DrawerHeader,
  DrawerTitle,
  DrawerClose
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import type { TaskHeaderProps, CategoryConfig, IntensityConfig, PriorityConfig } from "../types";
import { Brain, Target, Clock, Zap } from "lucide-react";

// Category configuration with app colors
const categoryConfig: Record<string, CategoryConfig> = {
  'morning': {
    icon: '',
    label: 'Morning Routine',
    textColor: 'text-orange-300',
    bgColor: 'bg-orange-900/20',
    borderColor: 'border-orange-500/40',
    gradient: 'from-orange-500 to-amber-500'
  },
  'deep-work': {
    icon: '',
    label: 'Deep Work',
    textColor: 'text-blue-300',
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-500/40',
    gradient: 'from-blue-500 to-cyan-500'
  },
  'light-work': {
    icon: '',
    label: 'Light Work',
    textColor: 'text-green-300',
    bgColor: 'bg-green-900/20',
    borderColor: 'border-green-500/40',
    gradient: 'from-emerald-500 to-teal-500'
  },
  'wellness': {
    icon: '',
    label: 'Wellness',
    textColor: 'text-teal-300',
    bgColor: 'bg-teal-900/20',
    borderColor: 'border-teal-500/40',
    gradient: 'from-teal-500 to-emerald-500'
  },
  'admin': {
    icon: '',
    label: 'Administrative',
    textColor: 'text-indigo-300',
    bgColor: 'bg-indigo-900/20',
    borderColor: 'border-indigo-500/40',
    gradient: 'from-indigo-500 to-purple-500'
  }
};

// Focus intensity configuration
const intensityConfig: Record<number, IntensityConfig> = {
  1: { name: 'Light Focus', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: Clock, gradient: 'from-blue-500 to-cyan-500' },
  2: { name: 'Medium Focus', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', icon: Target, gradient: 'from-yellow-500 to-amber-500' },
  3: { name: 'Deep Flow', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: Brain, gradient: 'from-emerald-500 to-green-500' },
  4: { name: 'Ultra-Deep', color: 'bg-red-500/20 text-red-300 border-red-500/30', icon: Zap, gradient: 'from-red-500 to-orange-500' }
};

// Priority configuration
const priorityConfig: Record<string, PriorityConfig> = {
  low: { icon: '', label: 'Low', color: 'bg-green-900/30 text-green-300 border-green-500/30' },
  medium: { icon: '', label: 'Medium', color: 'bg-yellow-900/30 text-yellow-300 border-yellow-500/30' },
  high: { icon: '', label: 'High', color: 'bg-red-900/30 text-red-300 border-red-500/30' },
  urgent: { icon: '', label: 'Urgent', color: 'bg-purple-900/30 text-purple-300 border-purple-500/30' }
};

export const TaskHeader: React.FC<TaskHeaderProps> = React.memo(({
  title,
  category,
  focusIntensity = 2,
  priority = 'medium',
  workType,
  onClose
}) => {
  const config = categoryConfig[category];
  const intensity = intensityConfig[focusIntensity];
  const priorityCfg = priorityConfig[priority];
  const isDeepWork = workType === 'deep';

  return (
    <DrawerHeader className="px-6 py-4 border-b border-white/10 shrink-0">
      <div className="flex items-start gap-4">
        {/* Intensity Icon */}
        <div className={cn(
          "p-3 rounded-2xl shrink-0",
          "bg-gradient-to-br",
          intensity.gradient,
          "shadow-lg"
        )}>
          <intensity.icon className="w-6 h-6 text-white" />
        </div>

        {/* Title & Badges */}
        <div className="flex-1 min-w-0">
          <DrawerTitle className="text-xl font-bold text-white leading-tight mb-2">
            {title}
          </DrawerTitle>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Badge */}
            <Badge
              className={cn(
                "text-xs font-medium",
                config.bgColor,
                config.borderColor,
                config.textColor,
                "border"
              )}
            >
              <Tag className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>

            {/* Intensity Badge */}
            <Badge
              className={cn(
                "text-xs font-medium border",
                intensity.color
              )}
            >
              {intensity.name}
            </Badge>

            {/* Priority Badge */}
            <Badge
              className={cn(
                "text-xs font-medium border",
                priorityCfg.color
              )}
            >
              {priorityCfg.label}
            </Badge>

            {/* Work Type Badge */}
            <Badge
              className={cn(
                "text-xs font-medium border",
                isDeepWork
                  ? "bg-blue-900/30 text-blue-300 border-blue-500/30"
                  : "bg-emerald-900/30 text-emerald-300 border-emerald-500/30"
              )}
            >
              {isDeepWork ? 'Deep Work' : 'Light Work'}
            </Badge>
          </div>
        </div>

        {/* Close Button */}
        <DrawerClose asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </DrawerClose>
      </div>
    </DrawerHeader>
  );
});

TaskHeader.displayName = 'TaskHeader';

export default TaskHeader;
