
import { Button } from '@/components/ui/button';

interface ViewModeSwitcherProps {
  viewMode: "table" | "cards";
  setViewMode: (mode: "table" | "cards") => void;
}

export function ViewModeSwitcher({ viewMode, setViewMode }: ViewModeSwitcherProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant={viewMode === "table" ? "default" : "outline"}
        className="rounded-md px-3 text-sm"
        onClick={() => setViewMode("table")}
      >
        Table
      </Button>
      <Button
        size="sm"
        variant={viewMode === "cards" ? "default" : "outline"}
        className="rounded-md px-3 text-sm"
        onClick={() => setViewMode("cards")}
      >
        Cards
      </Button>
    </div>
  );
}
