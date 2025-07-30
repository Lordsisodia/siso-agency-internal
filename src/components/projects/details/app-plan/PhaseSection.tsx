
import { useState, useRef, useEffect } from 'react';
import { AnimatedCard } from '@/components/ui/animated-card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from 'lucide-react';
import { SubsectionContent } from './SubsectionContent';

export interface PhaseSubsection {
  id: string;
  title: string;
  content: string;
  actionableSteps?: string[];
  expectedOutcomes?: string[];
  bestPractices?: string[];
}

interface PhaseSectionProps {
  id: string;
  title: string;
  description: string;
  subsections: PhaseSubsection[];
  isActive: boolean;
  onSectionRef: (id: string, ref: HTMLDivElement | null) => void;
}

export function PhaseSection({ 
  id, 
  title, 
  description, 
  subsections,
  isActive,
  onSectionRef
}: PhaseSectionProps) {
  return (
    <div 
      id={id}
      ref={(el) => onSectionRef(id, el)}
      className="scroll-mt-20"
    >
      <AnimatedCard className="mb-8 border border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
          <div>
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            <p className="text-lg text-[#FF9800]">{description}</p>
          </div>
          <Badge variant="outline" className="bg-[#FF5722]/10 text-[#FF9800] border-[#FF5722]/20 px-3 py-1">
            {id.substring(0, 8).toUpperCase()}
          </Badge>
        </div>
        
        <div className="space-y-6">
          {subsections.map(subsection => (
            <Collapsible 
              key={subsection.id}
              defaultOpen={true}
              className="border border-white/10 rounded-lg overflow-hidden"
            >
              <CollapsibleTrigger className="w-full p-4 flex items-center justify-between bg-black/20 hover:bg-black/30 transition-colors">
                <h4 className="text-md font-medium text-white text-left">{subsection.title}</h4>
                <div className="flex items-center">
                  <Badge className="mr-2 bg-[#FF5722] hover:bg-[#E64A19]">Details</Badge>
                  <ChevronDown className="h-5 w-5 text-[#FF9800] transition-transform duration-200" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 bg-black/10">
                <SubsectionContent subsection={subsection} />
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </AnimatedCard>
    </div>
  );
}
