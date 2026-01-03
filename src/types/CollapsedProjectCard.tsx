import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CollapsedProjectCardProps {
  projectName: string;
  projectLogo?: string;
  onClick: () => void;
}

export function CollapsedProjectCard({ projectName, projectLogo, onClick }: CollapsedProjectCardProps) {
  // Get the first letter or shortened name for display
  const getShortName = (name: string) => {
    if (!name) return 'P';
    
    const words = name.split(' ');
    if (words.length === 1) {
      return name.substring(0, 3);
    }
    
    // Get first letter of each word (up to 3 letters)
    return words.slice(0, 3).map(word => word[0]).join('');
  };
  
  const shortName = getShortName(projectName);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClick}
            className="w-full h-16 flex items-center justify-center my-2 bg-siso-bg-alt hover:bg-siso-bg-alt/80 border border-siso-border"
          >
            {projectLogo ? (
              <div className="relative h-8 w-8 rounded-md overflow-hidden">
                <Avatar className="h-8 w-8 rounded-md">
                  <AvatarImage src={projectLogo} alt={projectName} />
                  <AvatarFallback className="rounded-md bg-siso-orange/20 text-siso-orange">
                    {shortName.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </div>
            ) : (
              <FolderOpen className="h-5 w-5 text-siso-orange" />
            )}
            <span className="sr-only">{projectName}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{projectName}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
