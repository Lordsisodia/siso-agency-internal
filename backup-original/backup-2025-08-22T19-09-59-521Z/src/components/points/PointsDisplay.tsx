import { Trophy, Star } from 'lucide-react';
import { usePoints } from '@/hooks/usePoints';
import { Skeleton } from '@/components/ui/skeleton';

interface PointsDisplayProps {
  userId: string;
  variant?: 'default' | 'compact';
}

export const PointsDisplay = ({ userId, variant = 'default' }: PointsDisplayProps) => {
  const { points, rank, isLoading } = usePoints(userId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 text-sm text-siso-text/90">
        <Trophy className="w-4 h-4 text-siso-orange" />
        <span>{points}</span>
        <Star className="w-4 h-4 text-siso-orange ml-2" />
        <span>{rank}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4 rounded-lg bg-siso-text/5 border border-siso-text/10">
      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-siso-orange" />
        <span className="text-lg font-semibold text-siso-text-bold">{points} Points</span>
      </div>
      <div className="flex items-center gap-2">
        <Star className="w-5 h-5 text-siso-orange" />
        <span className="text-lg font-semibold text-siso-text-bold">{rank}</span>
      </div>
    </div>
  );
};