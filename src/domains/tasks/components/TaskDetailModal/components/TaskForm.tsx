"use client";

import React, { useMemo } from "react";
import { Clock, Timer, CheckCircle2, Circle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { TaskFormProps } from "../types";

export const TaskForm: React.FC<TaskFormProps> = React.memo(({
  description,
  startTime,
  endTime,
  duration,
  workType,
  completed,
  onDescriptionChange,
  onToggleComplete,
  onStartFocus
}) => {
  const isDeepWork = workType === 'deep';

  // Theme classes based on work type
  const theme = useMemo(() => ({
    bg: isDeepWork ? 'bg-blue-900/20' : 'bg-green-900/20',
    border: isDeepWork ? 'border-blue-500/30' : 'border-green-500/30',
    text: isDeepWork ? 'text-blue-300' : 'text-green-300',
    button: isDeepWork
      ? 'bg-blue-600 hover:bg-blue-700 text-white'
      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
  }), [isDeepWork]);

  const durationHours = Math.floor(duration / 60);
  const durationMinutes = duration % 60;

  return (
    <div className="space-y-4">
      {/* Info Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Time Card */}
        <div className={cn(
          "rounded-xl p-4 border",
          "bg-white/5 border-white/10"
        )}>
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-medium uppercase tracking-wider">Time</span>
          </div>
          <div className="text-white font-semibold">
            {startTime} - {endTime}
          </div>
        </div>

        {/* Duration Card */}
        <div className={cn(
          "rounded-xl p-4 border",
          "bg-white/5 border-white/10"
        )}>
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
            <Timer className="h-3.5 w-3.5" />
            <span className="font-medium uppercase tracking-wider">Duration</span>
          </div>
          <div className="text-white font-semibold">
            {durationHours > 0 && `${durationHours}h `}{durationMinutes > 0 && `${durationMinutes}m`}
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className={cn(
        "rounded-xl p-4 border",
        theme.bg,
        theme.border
      )}>
        <div className="flex items-center gap-2 text-gray-400 text-xs mb-3">
          <span className="font-medium uppercase tracking-wider">Description</span>
        </div>
        <Textarea
          value={description || ''}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className={cn(
            "min-h-[80px] resize-none text-sm",
            "bg-black/20 border-white/10 text-white placeholder:text-gray-500",
            "focus:border-white/20 focus:ring-0"
          )}
          placeholder="Add task description..."
        />
      </div>

      {/* Status & Actions */}
      <div className={cn(
        "rounded-xl p-4 border",
        "bg-white/5 border-white/10"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleComplete}
              className={cn(
                "p-2 rounded-xl transition-all duration-200",
                completed
                  ? "bg-green-500/20 text-green-400"
                  : "bg-white/5 text-gray-500 hover:bg-white/10"
              )}
            >
              {completed ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <Circle className="h-6 w-6" />
              )}
            </button>
            <div>
              <div className={cn(
                "text-sm font-medium",
                completed ? "text-green-400" : "text-gray-300"
              )}>
                {completed ? "Completed" : "Not Completed"}
              </div>
              <div className="text-xs text-gray-500">
                Tap to toggle status
              </div>
            </div>
          </div>

          {/* Start Focus Button */}
          <Button
            onClick={onStartFocus}
            className={cn(
              "rounded-xl font-medium",
              theme.button
            )}
            size="sm"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Focus
          </Button>
        </div>
      </div>
    </div>
  );
});

TaskForm.displayName = 'TaskForm';

export default TaskForm;
