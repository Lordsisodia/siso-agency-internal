
import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Star, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecommendedPackageProps {
  onSelectRecommended: () => void;
  onCustomize: () => void;
  className?: string;
}

export function RecommendedPackage({ onSelectRecommended, onCustomize, className }: RecommendedPackageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative rounded-lg border border-siso-orange/40 bg-black/30 p-6 mb-6",
        className
      )}
    >
      <div className="absolute -top-3 right-4">
        <Badge className="bg-siso-orange text-white font-medium">RECOMMENDED</Badge>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-5 w-5 text-siso-orange fill-siso-orange" />
            <h3 className="text-xl font-bold text-white">Agency Essentials Package</h3>
          </div>
          
          <p className="text-siso-text mb-4">
            Our recommended package includes everything you need to run your OnlyFans agency efficiently,
            based on industry best practices and successful agency implementations.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-siso-orange mt-1 flex-shrink-0" />
              <span className="text-siso-text">Landing page for client acquisition</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-siso-orange mt-1 flex-shrink-0" />
              <span className="text-siso-text">Client onboarding workflow</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-siso-orange mt-1 flex-shrink-0" />
              <span className="text-siso-text">Creator dashboard with to-do list</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-siso-orange mt-1 flex-shrink-0" />
              <span className="text-siso-text">Content management system</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-siso-orange mt-1 flex-shrink-0" />
              <span className="text-siso-text">Agency dashboard with analytics</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-siso-orange mt-1 flex-shrink-0" />
              <span className="text-siso-text">Timeline and planning tools</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col justify-center gap-3 min-w-[200px]">
          <Button 
            onClick={onSelectRecommended}
            className="bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90 w-full"
          >
            <Zap className="h-4 w-4 mr-2" />
            Select Recommended
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onCustomize}
            className="border-siso-text/20 text-siso-text hover:bg-black/40 w-full"
          >
            Customize Features
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
