import { Flame } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Automation } from './types';

interface AutomationCardProps {
  automation: Automation;
  onClick: (automation: Automation) => void;
}

export function AutomationCard({ automation, onClick }: AutomationCardProps) {
  return (
    <Card 
      className="group relative overflow-hidden bg-gradient-to-br from-siso-text/5 to-siso-text/10 backdrop-blur-lg border-siso-text/10 hover:border-siso-orange/50 transition-all duration-500 cursor-pointer hover:shadow-lg hover:shadow-siso-orange/20"
      onClick={() => onClick(automation)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-siso-red/5 to-siso-orange/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardContent className="relative p-4 z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-siso-red/20 to-siso-orange/20 flex items-center justify-center group-hover:animate-glow">
              <Flame className="w-4 h-4 text-siso-red" />
            </div>
            <div className="absolute inset-0 rounded-full bg-siso-red/20 animate-ping opacity-0 group-hover:opacity-75" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-siso-text-bold truncate group-hover:text-siso-orange transition-colors duration-300">
              {automation.name}
            </h3>
            <p className="text-xs text-siso-text/80">
              {automation.platform || 'General'}
            </p>
          </div>
        </div>

        {automation.description && (
          <div className="mt-3 relative overflow-hidden">
            <p className="text-xs text-siso-text line-clamp-2 group-hover:text-siso-text/90 transition-colors duration-300">
              {automation.description}
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-siso-bg/20 to-transparent" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}