import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Zap } from 'lucide-react';

interface AutoContinuationControlsProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
}

export const AutoContinuationControls: React.FC<AutoContinuationControlsProps> = ({
  enabled,
  onToggle,
  className
}) => {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-continue" className="flex items-center gap-2 cursor-pointer">
            <Zap className="w-4 h-4 text-yellow-500" />
            Auto-continuation
          </Label>
          <Switch
            id="auto-continue"
            checked={enabled}
            onCheckedChange={onToggle}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Automatically continue when Claude reaches token limit
        </p>
      </CardContent>
    </Card>
  );
};