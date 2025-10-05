/**
 * Calendar Demo Component
 * 
 * Demonstration of the Calendar component with single date selection and accessibility features.
 * Shows best practices for calendar integration and user feedback.
 * 
 * Features:
 * - Single date selection with state management
 * - Accessibility with aria-live region for screen readers
 * - External link to React DayPicker documentation
 * - Clean layout with proper spacing
 * - Border styling for visual definition
 * 
 * Usage Example:
 * ```tsx
 * import { Component } from '@/components/ui/calendar-demo';
 * 
 * <Component />
 * ```
 */

"use client";

import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

function Component() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div>
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-lg border border-border p-2"
      />
      <p
        className="mt-4 text-center text-xs text-muted-foreground"
        role="region"
        aria-live="polite"
      >
        Calendar -{" "}
        <a
          className="underline hover:text-foreground"
          href="https://daypicker.dev/"
          target="_blank"
          rel="noopener nofollow"
        >
          React DayPicker
        </a>
      </p>
    </div>
  );
}

export { Component };