"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ActionBarProps } from "../types";

export const ActionBar: React.FC<ActionBarProps> = React.memo(({
  onCancel,
  onSave,
  workType
}) => {
  const isDeepWork = workType === 'deep';

  const themeButton = isDeepWork
    ? 'bg-blue-600 hover:bg-blue-700 text-white'
    : 'bg-emerald-600 hover:bg-emerald-700 text-white';

  return (
    <div className="px-6 py-4 border-t border-white/10 shrink-0 bg-white/5">
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1 rounded-xl border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          className={cn(
            "flex-1 rounded-xl font-medium",
            themeButton
          )}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
});

ActionBar.displayName = 'ActionBar';

export default ActionBar;
