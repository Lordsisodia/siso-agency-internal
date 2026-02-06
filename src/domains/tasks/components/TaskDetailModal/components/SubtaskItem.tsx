"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Timer, Play, Edit3, Trash2, Save, CheckCircle2, Circle, CircleDotDashed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { SubtaskItemProps } from "../types";

export const SubtaskItem: React.FC<SubtaskItemProps> = React.memo(({
  subtask,
  workType,
  isEditing,
  onToggleStatus,
  onUpdate,
  onDelete,
  onStartEdit,
  onCancelEdit,
  onStartFocus
}) => {
  const isDeepWork = workType === 'deep';

  // Theme classes based on work type
  const theme = useMemo(() => ({
    bg: isDeepWork ? 'bg-blue-900/20' : 'bg-green-900/20',
    border: isDeepWork ? 'border-blue-500/30' : 'border-green-500/30',
    text: isDeepWork ? 'text-blue-300' : 'text-green-300',
    inputBg: isDeepWork ? 'bg-blue-900/30' : 'bg-green-900/30',
    inputBorder: isDeepWork ? 'border-blue-600/40' : 'border-green-600/40'
  }), [isDeepWork]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case "in-progress":
        return <CircleDotDashed className={cn("h-4 w-4", theme.text)} />;
      default:
        return <Circle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "rounded-xl border p-4",
        theme.bg,
        theme.border
      )}
    >
      <div className="flex flex-col space-y-3">
        <div className="flex items-start gap-3">
          <button
            onClick={onToggleStatus}
            className="mt-0.5 p-1 hover:bg-white/10 rounded-lg transition-colors shrink-0"
          >
            {getStatusIcon(subtask.status)}
          </button>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={subtask.title}
                  onChange={(e) => onUpdate({ title: e.target.value })}
                  className={cn(
                    "text-sm",
                    theme.inputBg,
                    theme.inputBorder,
                    "text-white border focus:border-white/30"
                  )}
                  placeholder="Subtask title"
                />
                <Textarea
                  value={subtask.description}
                  onChange={(e) => onUpdate({ description: e.target.value })}
                  className={cn(
                    "text-sm min-h-[60px] resize-none",
                    theme.inputBg,
                    theme.inputBorder,
                    "text-white border focus:border-white/30"
                  )}
                  placeholder="Description"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Input
                    value={subtask.estimatedTime || ""}
                    onChange={(e) => onUpdate({ estimatedTime: e.target.value })}
                    className={cn(
                      "text-sm flex-1",
                      theme.inputBg,
                      theme.inputBorder,
                      "text-white border focus:border-white/30"
                    )}
                    placeholder="30min"
                  />
                  <Button
                    size="sm"
                    onClick={onCancelEdit}
                    className="bg-green-600 hover:bg-green-700 rounded-lg"
                  >
                    <Save className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <h4 className={cn(
                  "font-medium text-sm",
                  subtask.status === "completed"
                    ? "text-gray-500 line-through"
                    : "text-white"
                )}>
                  {subtask.title}
                </h4>
                {subtask.description && (
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {subtask.description}
                  </p>
                )}
                {subtask.estimatedTime && (
                  <div className="flex items-center text-xs text-gray-500">
                    <Timer className="w-3 h-3 mr-1" />
                    {subtask.estimatedTime}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Subtask Actions */}
        {!isEditing && (
          <div className="flex items-center justify-end gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={onStartFocus}
              className={cn(
                "h-8 w-8 p-0 rounded-lg",
                theme.text,
                "hover:bg-white/10"
              )}
            >
              <Play className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onStartEdit}
              className="h-8 w-8 p-0 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              className="h-8 w-8 p-0 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
});

SubtaskItem.displayName = 'SubtaskItem';

export default SubtaskItem;
