
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, Minus, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TierFeature {
  name: string;
  description: string;
  tiers: {
    mvp: boolean;
    standard: boolean;
    premium: boolean;
    enterprise: boolean;
  };
}

interface TierComparisonProps {
  features: TierFeature[];
  activeTier: 'mvp' | 'standard' | 'premium' | 'enterprise';
}

export const TierComparison = ({ features, activeTier }: TierComparisonProps) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <TooltipProvider>
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="border-siso-text/10">
              <TableHead className="text-siso-text">Feature</TableHead>
              <TableHead className="text-center text-siso-text">MVP</TableHead>
              <TableHead className="text-center text-siso-text">Standard</TableHead>
              <TableHead className="text-center text-siso-text">Premium</TableHead>
              <TableHead className="text-center text-siso-text">Enterprise</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="contents"
            >
              {features.map((feature, index) => (
                <motion.tr
                  key={index}
                  variants={item}
                  className="border-siso-text/10"
                >
                  <TableCell className="font-medium text-white">
                    <div className="flex items-center">
                      {feature.name}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="ml-1 text-siso-text hover:text-siso-orange">
                            <Info className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{feature.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    {feature.tiers.mvp ? (
                      <Check className={`h-4 w-4 mx-auto ${activeTier === 'mvp' ? 'text-siso-orange' : 'text-green-500/70'}`} />
                    ) : (
                      <Minus className="h-4 w-4 mx-auto text-siso-text/30" />
                    )}
                  </TableCell>
                  
                  <TableCell className="text-center">
                    {feature.tiers.standard ? (
                      <Check className={`h-4 w-4 mx-auto ${activeTier === 'standard' ? 'text-siso-orange' : 'text-green-500/70'}`} />
                    ) : (
                      <Minus className="h-4 w-4 mx-auto text-siso-text/30" />
                    )}
                  </TableCell>
                  
                  <TableCell className="text-center">
                    {feature.tiers.premium ? (
                      <Check className={`h-4 w-4 mx-auto ${activeTier === 'premium' ? 'text-siso-orange' : 'text-green-500/70'}`} />
                    ) : (
                      <Minus className="h-4 w-4 mx-auto text-siso-text/30" />
                    )}
                  </TableCell>
                  
                  <TableCell className="text-center">
                    {feature.tiers.enterprise ? (
                      <Check className={`h-4 w-4 mx-auto ${activeTier === 'enterprise' ? 'text-siso-orange' : 'text-green-500/70'}`} />
                    ) : (
                      <Minus className="h-4 w-4 mx-auto text-siso-text/30" />
                    )}
                  </TableCell>
                </motion.tr>
              ))}
            </motion.div>
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
};
