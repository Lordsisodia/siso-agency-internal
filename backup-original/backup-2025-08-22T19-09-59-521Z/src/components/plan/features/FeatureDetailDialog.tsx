
import React from 'react';
import { Clock, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface FeatureDetailProps {
  id?: string;
  name?: string;
  description?: string;
  tier?: 'mvp' | 'advanced' | 'premium';
  recommended?: boolean;
  category?: string;
  categoryName?: string;
  timeEstimate?: number;
  roi?: string;
}

interface FeatureDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureDetail: FeatureDetailProps | null;
}

export const FeatureDetailDialog: React.FC<FeatureDetailDialogProps> = ({
  open,
  onOpenChange,
  featureDetail
}) => {
  if (!featureDetail) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {featureDetail?.name}
            {featureDetail?.recommended && (
              <Badge className="ml-2 bg-siso-orange text-white">Recommended</Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <Badge 
                variant="outline" 
                className={cn(
                  "mt-1 mr-2",
                  featureDetail?.tier === 'mvp' && "bg-siso-orange/10 text-siso-orange border-siso-orange/20",
                  featureDetail?.tier === 'advanced' && "bg-blue-500/10 text-blue-400 border-blue-400/20",
                  featureDetail?.tier === 'premium' && "bg-purple-500/10 text-purple-400 border-purple-400/20"
                )}
              >
                {featureDetail?.tier === 'mvp' && 'MVP Tier'}
                {featureDetail?.tier === 'advanced' && 'Advanced Tier'}
                {featureDetail?.tier === 'premium' && 'Premium Tier'}
              </Badge>
              
              <Badge variant="outline" className="mt-1">
                {featureDetail?.categoryName}
              </Badge>
            </div>

            {featureDetail?.timeEstimate && featureDetail.timeEstimate > 0 && (
              <div className="text-sm text-siso-text flex items-center">
                <Clock className="h-4 w-4 mr-1 opacity-70" />
                <span>+{featureDetail.timeEstimate} {featureDetail.timeEstimate === 1 ? 'day' : 'days'}</span>
              </div>
            )}
          </div>
          
          <p className="text-siso-text">{featureDetail?.description}</p>
          
          {featureDetail?.roi && (
            <div className="bg-siso-orange/10 border border-siso-orange/20 rounded-md p-4 mt-4">
              <h4 className="text-white font-medium mb-1 flex items-center gap-2">
                <Target className="h-4 w-4 text-siso-orange" />
                Business Impact
              </h4>
              <p className="text-sm text-siso-text">{featureDetail.roi}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
