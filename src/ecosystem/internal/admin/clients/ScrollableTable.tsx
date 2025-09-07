import React, { useRef, useState, useEffect } from 'react';
import { ClientColumnPreference } from '@/types/client.types';
import { cn } from '@/lib/utils';
import '../../../components/ui/hide-scrollbar.css';

interface ScrollableTableProps {
  children: React.ReactNode;
  pinnedColumns: ClientColumnPreference[];
  className?: string;
}

export function ScrollableTable({ children, pinnedColumns, className }: ScrollableTableProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [leftShadowVisible, setLeftShadowVisible] = useState(false);
  const [rightShadowVisible, setRightShadowVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const headerElement = scrollContainerRef.current.querySelector('thead');
      if (headerElement) {
        setHeaderHeight(headerElement.offsetHeight);
        document.documentElement.style.setProperty('--header-height', `${headerElement.offsetHeight}px`);
      }
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollTop, scrollWidth, clientWidth } = scrollContainerRef.current;
        setLeftShadowVisible(scrollLeft > 10);
        setRightShadowVisible(scrollLeft < scrollWidth - clientWidth - 10);
        setIsScrolled(scrollTop > 0);
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      handleScroll();
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const pinnedWidth = pinnedColumns.reduce((sum, col) => sum + (col.width || 150), 0);

  return (
    <div className="relative rounded-md border overflow-hidden border-gray-800/30 bg-gray-900/50 shadow-lg backdrop-blur-sm">
      {leftShadowVisible && (
        <div 
          className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-900/90 to-transparent z-10 pointer-events-none"
          style={{ transform: 'translate3d(0,0,0)', willChange: 'opacity' }}
        />
      )}

      {rightShadowVisible && (
        <div 
          className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-900/90 to-transparent z-10 pointer-events-none"
          style={{ transform: 'translate3d(0,0,0)', willChange: 'opacity' }}
        />
      )}

      <div
        ref={scrollContainerRef}
        className={cn(
          "overflow-auto hide-scrollbar relative",
          "transition-[background-color,border-color] duration-150",
          "overscroll-x-none scroll-smooth",
          className
        )}
        style={{
          maxWidth: '100%',
          maxHeight: 'calc(100vh - 300px)',
          willChange: 'transform, scroll-position',
          backfaceVisibility: 'hidden',
          perspective: '1000px',
          transform: 'translate3d(0,0,0)',
          contain: 'content',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div style={{ 
          position: 'relative', 
          minWidth: '100%',
          contain: 'layout style paint'
        }}>
          {pinnedColumns.length > 0 && (
            <div
              className={cn(
                "absolute top-0 left-0 bottom-0 border-r border-gray-700/30 shadow-[4px_0_8px_rgba(0,0,0,0.3)]",
                "transition-all duration-150",
                isScrolled && "top-[var(--header-height)]"
              )}
              style={{ 
                width: `${pinnedWidth}px`,
                transform: 'translate3d(0,0,0)',
                willChange: 'transform'
              }}
            />
          )}

          {isScrolled && (
            <div
              className="sticky top-0 left-0 right-0 z-30 bg-gray-900/95 border-b border-gray-700/30 shadow-lg backdrop-blur-md"
              style={{
                height: `${headerHeight}px`,
                transform: 'translate3d(0,0,0)',
                willChange: 'transform'
              }}
            />
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
