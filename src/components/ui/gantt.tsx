
'use client';

import { cn } from '@/lib/utils';
import React, { FC } from 'react';
import { GanttContext } from './gantt/gantt-context';
import { GanttHeader } from './gantt/gantt-header';
import { GanttSidebar } from './gantt/gantt-sidebar';
import { GanttFeatureList, GanttFeatureItem } from './gantt/gantt-feature-item';
import { GanttMarker, GanttCreateMarkerTrigger } from './gantt/gantt-marker';
import { createInitialTimelineData } from './gantt/utils';

// Re-export all components and types for backward compatibility
export * from './gantt/types';
export * from './gantt/gantt-context';
export * from './gantt/gantt-header';
export * from './gantt/gantt-sidebar';
export * from './gantt/gantt-columns';
export * from './gantt/gantt-feature-item';
export * from './gantt/gantt-marker';

// Define the props types for GanttProvider
export type GanttProviderProps = GanttProps;

// New components to export
export const GanttProvider: FC<GanttProviderProps> = (props) => (
  <Gantt {...props} />
);

export const GanttTimeline: FC<{children: React.ReactNode, className?: string}> = ({ children, className }) => (
  <div data-roadmap-ui="gantt-timeline" className={cn("relative h-max w-max", className)}>
    {children}
  </div>
);

export const GanttToday: FC = () => {
  const today = new Date();
  return <GanttMarker id="today" date={today} label="Today" />;
};

export type GanttProps = {
  className?: string;
  children: React.ReactNode;
  sidebarWidth?: number;
  headerHeight?: number;
  rowHeight?: number;
  columnWidth?: number;
  zoom?: number;
  range?: 'daily' | 'monthly' | 'quarterly';
  rowCount?: number;
  today?: Date;
  reference?: React.RefObject<HTMLDivElement | null>;
  onAddItem?: (date: Date) => void;
};

export const Gantt: FC<GanttProps> = ({
  className,
  children,
  sidebarWidth = 300,
  headerHeight = 60,
  rowHeight = 36,
  columnWidth = 50,
  zoom = 100,
  range = 'monthly',
  rowCount = 20,
  today = new Date(),
  reference,
  onAddItem,
}) => {
  const timelineData = React.useMemo(() => createInitialTimelineData(today), [today]);

  return (
    <GanttContext.Provider
      value={{
        zoom,
        range,
        columnWidth,
        sidebarWidth,
        headerHeight,
        rowHeight,
        placeholderLength: 2,
        timelineData,
        ref: reference,
        onAddItem,
      }}
    >
      <div
        data-roadmap-ui="gantt"
        className={cn('flex h-max w-max', className)}
        style={{
          ['--gantt-sidebar-width' as string]: `${sidebarWidth}px`,
          ['--gantt-header-height' as string]: `${headerHeight}px`,
          ['--gantt-row-height' as string]: `${rowHeight}px`,
          ['--gantt-column-width' as string]: `${Math.round(
            (columnWidth * zoom) / 100
          )}px`,
          ['--gantt-row-count' as string]: `${rowCount}`,
        }}
        ref={reference}
      >
        {children}
      </div>
    </GanttContext.Provider>
  );
};
