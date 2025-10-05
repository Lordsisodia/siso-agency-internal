/**
 * Calendar Component
 * 
 * A comprehensive calendar component built on React DayPicker with modern styling and accessibility.
 * Features advanced styling, range selection, today indicator, and full customization support.
 * 
 * Features:
 * - Single, multiple, and range date selection modes
 * - Modern design with rounded corners and subtle shadows
 * - Today indicator with visual dot marker
 * - Range selection with proper start/middle/end styling
 * - Disabled dates with visual indicators
 * - Outside month dates with muted styling
 * - Custom navigation with Lucide React chevron icons
 * - Accessibility-first design with ARIA support
 * - Responsive layout for desktop and mobile
 * - Full customization through classNames prop
 * - Component composition through components prop
 * 
 * Technical Features:
 * - Built on react-day-picker v8+ for robust functionality
 * - Integrates with shadcn button variants for consistent styling
 * - Uses CSS custom properties for theming
 * - Supports all DayPicker props and methods
 * - Proper TypeScript typing with ComponentProps
 * - Class variance authority integration for styling
 * - Advanced CSS selectors for complex state styling
 * 
 * Dependencies:
 * - react-day-picker (calendar functionality)
 * - lucide-react (ChevronLeft, ChevronRight icons)
 * - class-variance-authority (button variants)
 * - Tailwind CSS (styling and responsive design)
 * 
 * Usage Examples:
 * ```tsx
 * import { Calendar } from '@/components/ui/calendar';
 * import { useState } from 'react';
 * 
 * // Single date selection
 * const [date, setDate] = useState<Date | undefined>(new Date());
 * <Calendar
 *   mode="single"
 *   selected={date}
 *   onSelect={setDate}
 *   className="rounded-lg border"
 * />
 * 
 * // Range selection
 * const [range, setRange] = useState<DateRange | undefined>();
 * <Calendar
 *   mode="range"
 *   selected={range}
 *   onSelect={setRange}
 *   numberOfMonths={2}
 * />
 * 
 * // Multiple dates
 * const [dates, setDates] = useState<Date[]>([]);
 * <Calendar
 *   mode="multiple"
 *   selected={dates}
 *   onSelect={setDates}
 * />
 * 
 * // Disabled dates
 * <Calendar
 *   mode="single"
 *   selected={date}
 *   onSelect={setDate}
 *   disabled={(date) => date < new Date()}
 * />
 * ```
 * 
 * Styling Customization:
 * ```tsx
 * <Calendar
 *   classNames={{
 *     day_button: "custom-day-styles",
 *     day_selected: "bg-purple-500 text-white",
 *     day_today: "font-bold text-primary"
 *   }}
 * />
 * ```
 * 
 * Component Customization:
 * ```tsx
 * <Calendar
 *   components={{
 *     Chevron: ({ orientation }) => 
 *       orientation === "left" ? <CustomLeftIcon /> : <CustomRightIcon />
 *   }}
 * />
 * ```
 */

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  components: userComponents,
  ...props
}: CalendarProps) {
  const defaultClassNames = {
    months: "relative flex flex-col sm:flex-row gap-4",
    month: "w-full",
    month_caption: "relative mx-10 mb-1 flex h-9 items-center justify-center z-20",
    caption_label: "text-sm font-medium",
    nav: "absolute top-0 flex w-full justify-between z-10",
    button_previous: cn(
      buttonVariants({ variant: "ghost" }),
      "size-9 text-muted-foreground/80 hover:text-foreground p-0",
    ),
    button_next: cn(
      buttonVariants({ variant: "ghost" }),
      "size-9 text-muted-foreground/80 hover:text-foreground p-0",
    ),
    weekday: "size-9 p-0 text-xs font-medium text-muted-foreground/80",
    day_button:
      "relative flex size-9 items-center justify-center whitespace-nowrap rounded-lg p-0 text-foreground outline-offset-2 group-[[data-selected]:not(.range-middle)]:[transition-property:color,background-color,border-radius,box-shadow] group-[[data-selected]:not(.range-middle)]:duration-150 focus:outline-none group-data-[disabled]:pointer-events-none focus-visible:z-10 hover:bg-accent group-data-[selected]:bg-primary hover:text-foreground group-data-[selected]:text-primary-foreground group-data-[disabled]:text-foreground/30 group-data-[disabled]:line-through group-data-[outside]:text-foreground/30 group-data-[outside]:group-data-[selected]:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 group-[.range-start:not(.range-end)]:rounded-e-none group-[.range-end:not(.range-start)]:rounded-s-none group-[.range-middle]:rounded-none group-data-[selected]:group-[.range-middle]:bg-accent group-data-[selected]:group-[.range-middle]:text-foreground",
    day: "group size-9 px-0 text-sm",
    range_start: "range-start",
    range_end: "range-end",
    range_middle: "range-middle",
    today:
      "*:after:pointer-events-none *:after:absolute *:after:bottom-1 *:after:start-1/2 *:after:z-10 *:after:size-[3px] *:after:-translate-x-1/2 *:after:rounded-full *:after:bg-primary [&[data-selected]:not(.range-middle)>*]:after:bg-background [&[data-disabled]>*]:after:bg-foreground/30 *:after:transition-colors",
    outside: "text-muted-foreground data-selected:bg-accent/50 data-selected:text-muted-foreground",
    hidden: "invisible",
    week_number: "size-9 p-0 text-xs font-medium text-muted-foreground/80",
  };

  const mergedClassNames: typeof defaultClassNames = Object.keys(defaultClassNames).reduce(
    (acc, key) => ({
      ...acc,
      [key]: classNames?.[key as keyof typeof classNames]
        ? cn(
            defaultClassNames[key as keyof typeof defaultClassNames],
            classNames[key as keyof typeof classNames],
          )
        : defaultClassNames[key as keyof typeof defaultClassNames],
    }),
    {} as typeof defaultClassNames,
  );

  const defaultComponents = {
    Chevron: (props: any) => {
      if (props.orientation === "left") {
        return <ChevronLeft size={16} strokeWidth={2} {...props} aria-hidden="true" />;
      }
      return <ChevronRight size={16} strokeWidth={2} {...props} aria-hidden="true" />;
    },
  };

  const mergedComponents = {
    ...defaultComponents,
    ...userComponents,
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("w-fit", className)}
      classNames={mergedClassNames}
      components={mergedComponents}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };