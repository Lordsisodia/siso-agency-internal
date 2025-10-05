
import React from 'react';
import { Button } from '@/components/ui/button';
import { planTiers } from '@/data/plan/featureData';
import { Settings } from 'lucide-react';

interface FeatureIntroductionProps {
  currentTier: string;
  onTierChange: (tier: string) => void;
  selectedFeaturesCount: number;
  timeEstimate: { totalDays: number; additionalHours: number };
}

export const FeatureIntroduction: React.FC<FeatureIntroductionProps> = ({
  currentTier,
  onTierChange,
  selectedFeaturesCount,
  timeEstimate
}) => {
  return (
    <div className="bg-black/20 backdrop-blur-sm border border-siso-text/10 rounded-lg p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="rounded-full bg-siso-orange/20 p-3 shrink-0">
          <Settings className="h-6 w-6 text-siso-orange" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Feature Selection</h3>
          <p className="text-siso-text mb-4">
            Pick up to 10 features for the free MVP tier. Each feature adds time to the 90-day base timeline.
            Need more features or a faster delivery? Upgrade to Advanced or Premium.
          </p>
          
          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-xs font-medium text-siso-text p-2 border-b border-siso-text/10"></th>
                  {planTiers.map(tier => (
                    <th key={tier.id} className="text-center text-xs font-medium text-siso-text p-2 border-b border-siso-text/10">
                      {tier.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-left text-xs text-white p-2 border-b border-siso-text/10">Max Features</td>
                  {planTiers.map(tier => (
                    <td key={tier.id} className="text-center text-xs text-siso-text p-2 border-b border-siso-text/10">
                      {tier.maxFeatures}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="text-left text-xs text-white p-2 border-b border-siso-text/10">Base Timeline</td>
                  {planTiers.map(tier => (
                    <td key={tier.id} className="text-center text-xs text-siso-text p-2 border-b border-siso-text/10">
                      {tier.timeline}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="text-left text-xs text-white p-2 border-b border-siso-text/10">Support Level</td>
                  {planTiers.map(tier => (
                    <td key={tier.id} className="text-center text-xs text-siso-text p-2 border-b border-siso-text/10">
                      {tier.supportLevel}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="text-left text-xs text-white p-2 border-b border-siso-text/10">Price</td>
                  {planTiers.map(tier => (
                    <td key={tier.id} className="text-center text-xs text-siso-text p-2 border-b border-siso-text/10">
                      {tier.price === 0 ? 'Free' : `£${tier.price}`}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="flex space-x-2 mb-4">
            {planTiers.map(tier => (
              <Button 
                key={tier.id}
                size="sm"
                variant={currentTier === tier.id ? 'default' : 'outline'}
                className={currentTier === tier.id ? 'bg-siso-orange hover:bg-siso-orange/90' : 'border-siso-text/20'}
                onClick={() => onTierChange(tier.id)}
              >
                {tier.name} {tier.price === 0 ? '(Free)' : `(£${tier.price})`}
              </Button>
            ))}
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-sm font-medium text-white mr-2">Selected Features:</span>
              <div className="bg-siso-orange/10 text-siso-orange border border-siso-orange/30 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                {selectedFeaturesCount} {currentTier === 'mvp' ? `/ 10` : ''}
              </div>
            </div>
            
            <div className="flex items-center">
              <span className="text-sm font-medium text-white mr-2">Estimated Timeline:</span>
              <div className="bg-siso-orange/10 text-siso-orange border border-siso-orange/30 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                {timeEstimate.totalDays} days {timeEstimate.additionalHours > 0 ? `+ ${Math.round(timeEstimate.additionalHours)} hours` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
