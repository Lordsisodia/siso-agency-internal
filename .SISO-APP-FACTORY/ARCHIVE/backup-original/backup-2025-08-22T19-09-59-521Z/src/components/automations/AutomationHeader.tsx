import { Bot, Zap, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AutomationFilters } from './AutomationFilters';
import { AutomationCategory } from './types';

interface AutomationHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: AutomationCategory;
  onCategoryChange: (category: AutomationCategory) => void;
  getCategoryCount: (category: AutomationCategory) => number;
}

export const AutomationHeader = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  getCategoryCount,
}: AutomationHeaderProps) => {
  return (
    <div className="flex flex-col space-y-4 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-siso-red to-siso-orange text-transparent bg-clip-text">
          SISO Automations
        </h1>
        <AutomationFilters
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
          getCategoryCount={getCategoryCount}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <Alert className="bg-siso-text/5 border border-siso-text/10 backdrop-blur-sm">
          <Bot className="h-4 w-4 text-siso-orange" />
          <AlertDescription className="text-siso-text/80">
            <span className="font-semibold text-siso-text">Automation Library:</span> Browse our collection of pre-built automations for various social media platforms and general tasks.
          </AlertDescription>
        </Alert>
        
        <Alert className="bg-siso-text/5 border border-siso-text/10 backdrop-blur-sm">
          <Zap className="h-4 w-4 text-siso-orange" />
          <AlertDescription className="text-siso-text/80">
            <span className="font-semibold text-siso-text">Quick Setup:</span> Click on any automation to view details, use cases, and setup instructions.
          </AlertDescription>
        </Alert>
        
        <Alert className="bg-siso-text/5 border border-siso-text/10 backdrop-blur-sm">
          <ArrowRight className="h-4 w-4 text-siso-orange" />
          <AlertDescription className="text-siso-text/80">
            <span className="font-semibold text-siso-text">Get Started:</span> Filter by platform, browse featured automations, or search for specific tasks you want to automate.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};