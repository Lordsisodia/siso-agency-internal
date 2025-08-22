
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ScrollButtonsProps {
  onScrollUp: () => void;
  onScrollDown: () => void;
}

export function ScrollButtons({ onScrollUp, onScrollDown }: ScrollButtonsProps) {
  const isMobile = useIsMobile();
  
  return (
    <>
      <Button
        variant="ghost"
        size={isMobile ? "default" : "icon"}
        className={`absolute ${isMobile ? 'left-12' : 'left-16'} top-2 z-20`}
        onClick={onScrollUp}
        aria-label="Scroll up"
      >
        <ChevronUp className={`h-${isMobile ? '5' : '4'} w-${isMobile ? '5' : '4'}`} />
      </Button>
      <Button
        variant="ghost"
        size={isMobile ? "default" : "icon"}
        className={`absolute ${isMobile ? 'left-12' : 'left-16'} bottom-2 z-20`}
        onClick={onScrollDown}
        aria-label="Scroll down"
      >
        <ChevronDown className={`h-${isMobile ? '5' : '4'} w-${isMobile ? '5' : '4'}`} />
      </Button>
    </>
  );
}
