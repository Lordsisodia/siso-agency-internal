import React, { useRef, useState, useEffect } from 'react';
import { ClientColumnPreference } from '@/types/client.types';
import { cn } from '@/shared/lib/utils';
import '@/shared/ui/hide-scrollbar.css';

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
    <div className="relative flex-1 w-full">
      {leftShadowVisible && (
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-[#08070E] via-[#08070E]/40 to-transparent"
        />
      )}

      {rightShadowVisible && (
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-[#08070E] via-[#08070E]/40 to-transparent"
        />
      )}

      <div
        ref={scrollContainerRef}
        className={cn(
          "relative hide-scrollbar overflow-x-auto overflow-y-visible",
          "scroll-smooth",
          className
        )}
        style={{
          maxWidth: '100%',
          willChange: 'transform, scroll-position',
          backfaceVisibility: 'hidden',
          transform: 'translate3d(0,0,0)',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div
          style={{
            position: 'relative',
            minWidth: '100%',
          }}
        >
          {pinnedColumns.length > 0 && (
            <div
              className={cn(
                "absolute top-0 left-0 bottom-0 border-r border-white/10",
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

          {children}
        </div>
      </div>
    </div>
  );
}
