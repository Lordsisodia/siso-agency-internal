import { useEffect } from 'react';
import { Coins } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PointsEarnedToastProps {
  points: number;
  action: string;
}

export const showPointsEarnedToast = ({ points, action }: PointsEarnedToastProps) => {
  toast({
    duration: 3000,
    className: "bg-siso-bg-alt border border-siso-border backdrop-blur-lg fixed bottom-4 right-4 animate-slide-in-right",
    description: (
      <div className="flex items-center gap-3 p-2">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-siso-red to-siso-orange rounded-full blur-lg animate-pulse opacity-50" />
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-r from-siso-red to-siso-orange flex items-center justify-center">
            <Coins className="w-5 h-5 text-white animate-bounce" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg bg-gradient-to-r from-siso-red to-siso-orange bg-clip-text text-transparent">
            +{points} Points
          </span>
          <span className="text-sm text-siso-text/80">
            {action}
          </span>
        </div>
      </div>
    ),
  });
};