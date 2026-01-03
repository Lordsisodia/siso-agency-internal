/**
 * Calendar Component
 * Basic calendar implementation for date selection
 */

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

export interface CalendarProps {
  className?: string
  classNames?: {
    months?: string
    month?: string
    caption?: string
    caption_label?: string
    nav?: string
    nav_button?: string
    nav_button_previous?: string
    nav_button_next?: string
    table?: string
    head_row?: string
    head_cell?: string
    row?: string
    cell?: string
    day?: string
    day_selected?: string
    day_today?: string
    day_outside?: string
    day_disabled?: string
    day_range_middle?: string
    day_hidden?: string
  }
  showOutsideDays?: boolean
  selected?: Date
  onSelect?: (date: Date) => void
  disabled?: (date: Date) => boolean
  mode?: "single" | "multiple" | "range"
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  selected,
  onSelect,
  disabled,
  ...props
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(
    selected || new Date()
  )

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate()

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay()

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    )
  }

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    )
  }

  const isSelected = (day: number) => {
    if (!selected) return false
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    )
    return (
      date.getFullYear() === selected.getFullYear() &&
      date.getMonth() === selected.getMonth() &&
      date.getDate() === selected.getDate()
    )
  }

  const isToday = (day: number) => {
    const today = new Date()
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    )
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    )
  }

  const handleDayClick = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    )
    if (disabled && disabled(date)) return
    onSelect?.(date)
  }

  return (
    <div className={cn("p-3", className)} {...props}>
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousMonth}
          className={cn("h-7 w-7 p-0", classNames?.nav_button_previous)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className={cn("text-sm font-medium", classNames?.caption_label)}>
          {currentMonth.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric"
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={goToNextMonth}
          className={cn("h-7 w-7 p-0", classNames?.nav_button_next)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <table className={cn("w-full border-collapse", classNames?.table)}>
        <thead>
          <tr className={classNames?.head_row}>
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <th
                key={day}
                className={cn(
                  "h-9 w-9 text-center text-xs font-normal text-muted-foreground",
                  classNames?.head_cell
                )}
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className={classNames?.row}>
            {emptyDays.map((_, i) => (
              <td
                key={`empty-${i}`}
                className={cn("h-9 w-9 text-center", classNames?.cell)}
              />
            ))}
            {days.map((day) => {
              const isCurrentSelected = isSelected(day)
              const isCurrentToday = isToday(day)
              const date = new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth(),
                day
              )
              const isDisabled = disabled?.(date)

              return (
                <td
                  key={day}
                  className={cn("h-9 w-9 text-center p-0", classNames?.cell)}
                >
                  <Button
                    variant={isCurrentSelected ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0 font-normal",
                      isCurrentToday && "bg-accent text-accent-foreground",
                      isCurrentSelected &&
                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                      isDisabled &&
                        "text-muted-foreground opacity-50 cursor-not-allowed",
                      classNames?.day,
                      isCurrentSelected && classNames?.day_selected,
                      isCurrentToday && classNames?.day_today,
                      isDisabled && classNames?.day_disabled
                    )}
                    disabled={isDisabled}
                    onClick={() => handleDayClick(day)}
                  >
                    {day}
                  </Button>
                </td>
              )
            })}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }