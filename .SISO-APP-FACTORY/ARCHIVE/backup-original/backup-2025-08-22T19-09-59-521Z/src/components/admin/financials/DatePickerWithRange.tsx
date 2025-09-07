
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { addDays, format } from "date-fns";
import { Button } from "@/components/ui/button";

interface DatePickerWithRangeProps {
  date: DateRange | undefined;
  setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
}

export function DatePickerWithRange({
  date,
  setDate,
}: DatePickerWithRangeProps) {
  const presets = [
    {
      name: "This Month",
      range: {
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      },
    },
    {
      name: "Last Month",
      range: {
        from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        to: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
      },
    },
    {
      name: "Last 3 Months",
      range: {
        from: new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1),
        to: new Date(),
      },
    },
    {
      name: "Year to Date",
      range: {
        from: new Date(new Date().getFullYear(), 0, 1),
        to: new Date(),
      },
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="p-3 space-y-3 border-r">
        <h3 className="text-sm font-medium">Date Presets</h3>
        <div className="flex flex-col gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.name}
              variant="outline"
              size="sm"
              className="justify-start text-left"
              onClick={() => {
                setDate(preset.range);
              }}
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>
      <div className="p-3">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={setDate}
          numberOfMonths={1}
        />
      </div>
    </div>
  );
}
