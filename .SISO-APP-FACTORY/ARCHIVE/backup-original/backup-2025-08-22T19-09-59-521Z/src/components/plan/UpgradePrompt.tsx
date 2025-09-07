
import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UpgradePromptProps {
  show: boolean;
  onUpgrade: (tier: string) => void;
  onDismiss: () => void;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  show,
  onUpgrade,
  onDismiss
}) => {
  if (!show) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 p-4 bg-siso-orange/10 border border-siso-orange/30 rounded-lg"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-siso-orange shrink-0 mt-1" />
        <div>
          <h4 className="text-white font-medium mb-1">Feature Limit Reached</h4>
          <p className="text-sm text-siso-text mb-3">
            You've reached the 10-feature limit for the MVP tier. Upgrade to Advanced or Premium for unlimited features.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => onUpgrade('advanced')}
              className="bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90"
            >
              Upgrade to Advanced
              <Zap className="ml-2 h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onDismiss}
              className="border-siso-text/20 text-siso-text"
            >
              Deselect Features
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
