import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface ClaudeMemoriesDropdownProps {
  memories?: string[];
  onSelect?: (memory: string) => void;
}

export const ClaudeMemoriesDropdown: React.FC<ClaudeMemoriesDropdownProps> = ({ 
  memories = [], 
  onSelect 
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          Memories <ChevronDown className="w-4 h-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {memories.length > 0 ? (
          memories.map((memory, index) => (
            <DropdownMenuItem key={index} onClick={() => onSelect?.(memory)}>
              {memory}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>No memories available</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};