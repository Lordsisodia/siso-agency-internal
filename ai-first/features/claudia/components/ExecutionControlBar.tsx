import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, RefreshCw } from 'lucide-react';

interface ExecutionControlBarProps {
  isRunning: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onRestart: () => void;
  className?: string;
}

export const ExecutionControlBar: React.FC<ExecutionControlBarProps> = ({
  isRunning,
  isPaused,
  onStart,
  onPause,
  onStop,
  onRestart,
  className
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {!isRunning ? (
        <Button onClick={onStart} size="sm" variant="default">
          <Play className="w-4 h-4 mr-1" />
          Start
        </Button>
      ) : (
        <>
          <Button 
            onClick={isPaused ? onStart : onPause} 
            size="sm" 
            variant={isPaused ? "default" : "secondary"}
          >
            {isPaused ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
            {isPaused ? "Resume" : "Pause"}
          </Button>
          <Button onClick={onStop} size="sm" variant="destructive">
            <Square className="w-4 h-4 mr-1" />
            Stop
          </Button>
        </>
      )}
      <Button onClick={onRestart} size="sm" variant="outline">
        <RefreshCw className="w-4 h-4 mr-1" />
        Restart
      </Button>
    </div>
  );
};