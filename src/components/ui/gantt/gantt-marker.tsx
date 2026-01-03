
'use client';

import React, { FC } from 'react';
import { cn } from '@/lib/utils';
import { useGanttContext } from './gantt-context';
import { GanttMarkerProps } from './types';
import { getDifferenceIn, calculateInnerOffset, format } from './utils';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Trash as TrashIcon } from 'lucide-react';

export const GanttMarker: FC<
  GanttMarkerProps & {
    onRemove?: (id: string) => void;
    className?: string;
  }
> = ({ label, date, id, onRemove, className }) => {
  const gantt = useGanttContext();
  const differenceIn = getDifferenceIn(gantt.range);
  const timelineStartDate = new Date(gantt.timelineData.at(0)?.year ?? 0, 0, 1);
  const offset = differenceIn(date, timelineStartDate);
  const innerOffset = calculateInnerOffset(
    date,
    gantt.range,
    (gantt.columnWidth * gantt.zoom) / 100
  );
  const parsedOffset =
    offset * (gantt.columnWidth * gantt.zoom) / 100 + innerOffset;

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className={cn(
            'group absolute top-0 z-10 flex flex-col items-center justify-center',
            className
          )}
          style={{
            left: parsedOffset,
            height: 'calc(var(--gantt-row-height) * var(--gantt-row-count))',
          }}
        >
          <div className="-translate-x-1/2 absolute top-4 opacity-80 flex flex-col items-center w-max">
            <div className="rounded-full bg-foreground w-3 h-3 outline outline-2 outline-white dark:outline-black" />
            <div className="h-full w-[1px] bg-foreground" />
          </div>

          <div className="-translate-x-1/2 -translate-y-1/3 group-hover:translate-y-0 absolute top-4 whitespace-nowrap rounded-full border border-border/50 bg-background/95 px-2 py-1 text-xs transition-transform">
            <p className="text-foreground">{label}</p>
            <p className="text-muted-foreground">
              {format(date, 'MMM dd, yyyy')}
            </p>
          </div>
        </div>
      </ContextMenuTrigger>
      {onRemove && (
        <ContextMenuContent>
          <ContextMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onRemove(id)}
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </ContextMenuItem>
        </ContextMenuContent>
      )}
    </ContextMenu>
  );
};

export type GanttCreateMarkerTriggerProps = {
  onCreateMarker: (date: Date) => void;
  className?: string;
};

export const GanttCreateMarkerTrigger: FC<GanttCreateMarkerTriggerProps> = ({
  onCreateMarker,
  className,
}) => {
  const gantt = useGanttContext();
  const [mousePosition, mouseRef] = useMouse<HTMLDivElement>();
  const [windowScroll] = useWindowScroll();
  const x = useThrottle(
    mousePosition.x -
      (mouseRef.current?.getBoundingClientRect().x ?? 0) -
      (windowScroll.x ?? 0),
    10
  );

  const date = getDateByMousePosition(gantt, x);

  const handleClick = () => onCreateMarker(date);

  return (
    <div
      className={cn(
        'group pointer-events-none absolute top-0 left-0 h-full w-full select-none overflow-visible',
        className
      )}
      ref={mouseRef}
    >
      <div
        className="-ml-2 pointer-events-auto sticky top-6 z-20 flex w-4 flex-col items-center justify-center gap-1 overflow-visible opacity-0 group-hover:opacity-100"
        style={{ transform: `translateX(${x}px)` }}
      >
        <button
          type="button"
          className="z-50 inline-flex h-4 w-4 items-center justify-center rounded-full bg-card"
          onClick={handleClick}
        >
          <PlusIcon size={12} className="text-muted-foreground" />
        </button>
        <div className="whitespace-nowrap rounded-full border border-border/50 bg-background/90 px-2 py-1 text-foreground text-xs backdrop-blur-lg">
          {format(date, 'MMM dd, yyyy')}
        </div>
      </div>
    </div>
  );
};

import { useMouse, useThrottle, useWindowScroll } from '@uidotdev/usehooks';
import { Plus as PlusIcon } from 'lucide-react';
import { getDateByMousePosition } from './utils';
