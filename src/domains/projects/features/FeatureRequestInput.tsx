
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MessageSquare, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function FeatureRequestInput() {
  const [request, setRequest] = useState('');
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-white">Request New Feature</h3>
          <MessageSquare className="w-5 h-5 text-[#9b87f5]" />
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                <Info className="w-4 h-4" />
                How it works
              </Button>
            </TooltipTrigger>
            <TooltipContent className="w-80 p-4" align="end">
              <p className="text-sm">
                Describe the feature you'd like to add to your project. Our team will review
                your request, estimate the cost and timeline, and get back to you soon.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Textarea 
        value={request}
        onChange={(e) => setRequest(e.target.value)}
        placeholder="Describe the feature you'd like to request... (e.g., 'Add NFT Marketplace where users can buy and sell tokens')"
        className="bg-black/20 border-gray-700 text-white min-h-[100px]"
        rows={5}
      />
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-400">
          <span>Estimated Cost</span>
          <span>£500 - £1,000</span>
        </div>
        <Button 
          className="w-full bg-[#9b87f5] hover:bg-[#9b87f5]/90"
          disabled
        >
          Submit Request (Coming Soon)
        </Button>
      </div>
    </div>
  );
}
