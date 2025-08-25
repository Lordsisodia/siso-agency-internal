import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EarningTask {
  action: string;
  points: string;
}

interface EarningCategoryProps {
  title: string;
  description: string;
  icon: LucideIcon;
  items: EarningTask[];
  isSelected?: boolean;
  onClick?: () => void;
  progress?: { completed: number; total: number };
}

export const EarningCategory = ({
  title,
  description,
  icon: Icon,
  items,
  isSelected,
  onClick,
  progress
}: EarningCategoryProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-lg transition-all duration-300",
        "hover:bg-siso-text/5 group relative",
        "border border-transparent hover:border-siso-border",
        isSelected && "bg-gradient-to-br from-siso-red/10 to-siso-orange/10 border-siso-border"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center",
          "bg-gradient-to-br from-siso-red/10 to-siso-orange/10",
          "group-hover:from-siso-red/20 group-hover:to-siso-orange/20",
          "transition-all duration-300"
        )}>
          <Icon className="w-6 h-6 text-siso-orange" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "text-base font-semibold truncate",
            isSelected ? "text-siso-text-bold" : "text-siso-text",
            "group-hover:text-siso-text-bold"
          )}>{title}</h3>
          <p className="text-sm text-siso-text/70 truncate">{description}</p>
          {progress && (
            <div className="mt-2">
              <div className="h-1 bg-siso-text/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-siso-red to-siso-orange transition-all duration-300"
                  style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                />
              </div>
              <p className="text-xs text-siso-text/60 mt-1">
                {progress.completed}/{progress.total} completed
              </p>
            </div>
          )}
        </div>
      </div>
    </button>
  );
};