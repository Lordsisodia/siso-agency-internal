
import { Progress } from "@/components/ui/progress";

interface ImportProgressProps {
  progress: number;
  isImporting: boolean;
}

export function ImportProgress({ progress, isImporting }: ImportProgressProps) {
  if (!isImporting && progress === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span>{isImporting ? "Importing..." : "Import complete"}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} />
    </div>
  );
}
