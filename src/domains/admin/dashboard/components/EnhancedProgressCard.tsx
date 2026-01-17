import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ProgressItem {
  label: string;
  value: number;
  color: string;
}

interface EnhancedProgressCardProps {
  title: string;
  progress: ProgressItem[];
  showPercentage?: boolean;
}

export function EnhancedProgressCard({ title, progress, showPercentage = false }: EnhancedProgressCardProps) {
  return (
    <div className="space-y-4">
      {progress.map((item) => (
        <div key={item.label} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">{item.label}</span>
            {showPercentage && (
              <span className="text-sm font-medium text-white">{item.value}%</span>
            )}
          </div>
          <Progress
            value={item.value}
            className="h-2 bg-gray-700/50"
            indicatorColor={item.color}
          />
        </div>
      ))}
    </div>
  );
}

export default EnhancedProgressCard;

