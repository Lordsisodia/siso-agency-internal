import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Circle, CheckCircle2, Plus, Zap, Clock, ArrowRight, Flame, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TimeboxTask, TaskPosition, TIMEBOX_HOUR_HEIGHT, TimeboxViewMode } from '../../domain/types';
import { getCategoryStyles, getEnergyStyle, getEnergyColor, getEnergyBorder, getEnergyShadow } from '../../domain/utils';
import { isAutoTimebox } from '@/domains/lifelock/_shared/services/autoTimeblockService';

interface TimeboxTaskCardProps {
  task: TimeboxTask;
  position: TaskPosition;
  currentTimePosition: number;
  draggingTaskId: string | null;
  swipingTaskId: string | null;
  swipeDirection: 'left' | 'right' | null;
  index: number;
  isOverdue?: boolean;
  viewMode?: TimeboxViewMode;
  onToggleComplete: (taskId: string) => void;
  onAddAfter: (task: TimeboxTask, minutes: number) => void;
  onDragStart: (taskId: string) => void;
  onDrag: (taskId: string, info: any) => void;
  onDragEnd: (taskId: string, info: any) => void;
  onPan: (taskId: string, info: any) => void;
  onPanEnd: (taskId: string, info: any) => void;
  onTaskClick: (task: TimeboxTask) => void;
  onTaskDoubleClick: (task: TimeboxTask) => void;
  onPostponeTask?: (taskId: string, minutes: number) => void;
  onMoveToNow?: (taskId: string) => void;
}

export const TimeboxTaskCard: React.FC<TimeboxTaskCardProps> = ({
  task,
  position,
  currentTimePosition,
  draggingTaskId,
  swipingTaskId,
  swipeDirection,
  index,
  isOverdue = false,
  viewMode = 'category',
  onToggleComplete,
  onAddAfter,
  onDragStart,
  onDrag,
  onDragEnd,
  onPan,
  onPanEnd,
  onTaskClick,
  onTaskDoubleClick,
  onPostponeTask,
  onMoveToNow
}) => {
  const [showOverdueActions, setShowOverdueActions] = useState(false);
  const categoryStyles = getCategoryStyles(task.category, task.completed);
  const energyStyle = getEnergyStyle(task.intensity);
  const taskTitle = typeof task.title === 'string' ? task.title : '';
  const leadingEmojiMatch = taskTitle
    ? taskTitle.match(/^(\p{Extended_Pictographic}+)\s+(.*)$/u)
    : null;
  const leadingEmoji = leadingEmojiMatch?.[1] ?? null;
  const titleWithoutEmoji = leadingEmojiMatch?.[2] ?? taskTitle;
  const isAuto = isAutoTimebox(task);

  // Render energy indicator (fire dots or leaf)
  const renderEnergyIndicator = () => {
    if (task.completed) return null;

    const intensity = task.intensity || 'moderate';

    if (intensity === 'light') {
      return (
        <div className="flex items-center gap-0.5" title="Light energy">
          <Leaf className="h-3 w-3 text-green-400" />
        </div>
      );
    }

    const dotCount = energyStyle.dots;
    return (
      <div className="flex items-center gap-0.5" title={`${energyStyle.label} energy`}>
        {Array.from({ length: dotCount }).map((_, i) => (
          <Flame
            key={i}
            className={cn("h-3 w-3", energyStyle.color)}
          />
        ))}
      </div>
    );
  };

  return (
    <motion.div
      key={task.id}
      drag={draggingTaskId === task.id ? "y" : false}
      dragConstraints={{ top: -position.top, bottom: (23 * TIMEBOX_HOUR_HEIGHT) - position.top - position.height }}
      dragElastic={0.1}
      dragMomentum={false}
      onDragStart={() => onDragStart(task.id)}
      onDrag={(e, info) => onDrag(task.id, info)}
      onDragEnd={(e, info) => onDragEnd(task.id, info)}
      onPan={(e, info) => onPan(task.id, info)}
      onPanEnd={(e, info) => onPanEnd(task.id, info)}
      className={cn(
        "absolute rounded-xl cursor-move z-10 group touch-pan-y active:cursor-grabbing",
        "bg-gradient-to-br shadow-xl border-2",
        "transition-all duration-500 hover:shadow-2xl overflow-hidden",
        "ring-0 ring-transparent hover:ring-2 hover:ring-white/20",
        draggingTaskId === task.id && "scale-105 shadow-2xl ring-2 ring-sky-400/50 z-50",
        isOverdue && !task.completed && "border-l-2 border-l-red-400",
        task.completed
          ? "bg-gradient-to-br from-green-900/40 via-emerald-900/30 to-green-800/40"
          : viewMode === 'energy'
            ? getEnergyColor(task.intensity, task.completed)
            : task.color,
        viewMode === 'energy'
          ? getEnergyBorder(task.intensity, task.completed)
          : categoryStyles.border,
        viewMode === 'energy'
          ? getEnergyShadow(task.intensity, task.completed)
          : categoryStyles.shadow,
        categoryStyles.glow,
        !task.completed && (viewMode === 'energy' ? energyStyle.bg : categoryStyles.accent)
      )}
      style={{
        top: `${position.top}px`,
        height: `${Math.max(position.height - 4, 16)}px`,
        marginTop: '2px',
        left: 0,
        right: 0,
        width: '100%',
        zIndex: draggingTaskId === task.id ? 50 : 10
      }}
      initial={{
        opacity: 0,
        scale: 0.9,
        y: 20
      }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        // Add subtle pulse for tasks near current time
        ...(Math.abs(position.top - (currentTimePosition || -1000)) < 60 && currentTimePosition >= 0 && !task.completed ? {
          boxShadow: [
            "0 0 20px rgba(14, 165, 233, 0.3)",
            "0 0 30px rgba(14, 165, 233, 0.5)",
            "0 0 20px rgba(14, 165, 233, 0.3)"
          ]
        } : {})
      }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        type: "spring",
        stiffness: 300,
        damping: 25,
        boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      }}
      whileHover={{
        scale: 1.03,
        y: -3,
        rotateX: 5,
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        transition: {
          duration: 0.2,
          type: "spring",
          stiffness: 400
        }
      }}
      onHoverStart={() => isOverdue && !task.completed && setShowOverdueActions(true)}
      onHoverEnd={() => setShowOverdueActions(false)}
      whileTap={{
        scale: 0.97,
        transition: { duration: 0.1 }
      }}
      onClick={(e) => {
        if (draggingTaskId) return; // Don't open modal while dragging
        onTaskClick(task);
      }}
      onDoubleClick={() => onTaskDoubleClick(task)}
      layout
    >
      <div className="p-4 h-full flex flex-col justify-between relative overflow-hidden min-h-[80px]">
        {/* Swipe Action Visual Feedback */}
        {swipingTaskId === task.id && swipeDirection && (
          <motion.div
            className={cn(
              "absolute inset-0 flex items-center justify-center z-20",
              swipeDirection === 'left' && "bg-green-500/30",
              swipeDirection === 'right' && "bg-blue-500/30"
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {swipeDirection === 'left' && <CheckCircle2 className="h-12 w-12 text-green-400" />}
            {swipeDirection === 'right' && <motion.div className="h-12 w-12 text-blue-400">📅</motion.div>}
          </motion.div>
        )}

        {/* Enhanced background pattern with depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08)_0%,transparent_40%)] opacity-60" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.03)_50%,transparent_100%)]" />

        {/* Enhanced completion overlay effect */}
        {task.completed && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-emerald-400/15 to-green-500/20 border-l-2 border-green-400/40"
            initial={{ opacity: 0, scale: 0.95, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        )}

        {/* Enhanced shimmer effect on hover */}
        {!task.completed && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent transform -translate-x-full group-hover:translate-x-full"
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        )}

        {/* Task header section - Restructured Layout */}
        <div className="relative z-10 flex flex-col h-full">
          {/* First Line: Title (full width with reserved checkbox space) */}
          <h4 className={cn(
            "font-semibold text-sm leading-snug transition-all duration-300 group-hover:text-white pr-8",
            task.completed ? "text-green-100 line-through decoration-2 decoration-green-400/60" : "text-white"
          )}>
            {leadingEmoji ? (
              <span className="inline-flex items-center gap-1">
                <span>{leadingEmoji}</span>
                <span className="whitespace-pre-line">{titleWithoutEmoji}</span>
              </span>
            ) : (
              titleWithoutEmoji
            )}
          </h4>

          {/* Second Line: Time, Duration, and Energy Indicator (muted style) */}
          <div className="flex items-center gap-2 mt-1 text-[11px] text-white/50">
            <span>{task.startTime} - {task.endTime}</span>
            {!isAuto && (
              <span className="text-white/40">· {task.duration}m</span>
            )}
            {/* Energy indicator - shown in both views */}
            {!task.completed && renderEnergyIndicator()}
            {!isAuto && task.wasAutoAdjusted && task.originalStartTime && task.originalEndTime && (
              <span className="text-amber-300/70 flex items-center gap-1">
                <span aria-hidden="true">↺</span>
                <span>Adjusted</span>
              </span>
            )}
            {isOverdue && !task.completed && (
              <span className="bg-red-500/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                OVERDUE
              </span>
            )}
          </div>

          {/* Overdue Quick Actions - Show on hover for overdue tasks */}
          <AnimatePresence>
            {isOverdue && !task.completed && showOverdueActions && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1.5 mt-2"
              >
                <motion.button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleComplete(task.id);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1 px-2 py-1 bg-green-500/80 hover:bg-green-500 text-white text-[10px] font-medium rounded-md transition-colors"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Complete
                </motion.button>

                {onPostponeTask && (
                  <motion.button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPostponeTask(task.id, 30);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 px-2 py-1 bg-amber-500/80 hover:bg-amber-500 text-white text-[10px] font-medium rounded-md transition-colors"
                  >
                    <Clock className="h-3 w-3" />
                    +30m
                  </motion.button>
                )}

                {onMoveToNow && (
                  <motion.button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveToNow(task.id);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 px-2 py-1 bg-sky-500/80 hover:bg-sky-500 text-white text-[10px] font-medium rounded-md transition-colors"
                  >
                    <ArrowRight className="h-3 w-3" />
                    Move to Now
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Description - Only if exists and card is tall enough */}
          {task.description && task.duration >= 45 && (
            <div className="bg-black/20 border border-white/10 rounded-lg px-2 py-1.5 mt-2">
              <p className={cn(
                "text-[10px] leading-relaxed transition-all duration-300 line-clamp-2",
                task.completed ? "text-green-200/70" : "text-white/60 group-hover:text-white/75"
              )}>
                {task.description}
              </p>
            </div>
          )}

          {/* Bottom Row: Add button (hover only) and Checkbox */}
          <div className="flex items-center justify-end gap-2 mt-auto pt-2">
            {/* Add button - only shows on hover */}
            {!isAuto && (
              <motion.button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddAfter(task, 60);
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1 rounded-full bg-white/20 hover:bg-white/30 border border-white/40 transition-all opacity-0 group-hover:opacity-100"
                title="Add follow-up block"
              >
                <Plus className="h-3 w-3 text-white" />
              </motion.button>
            )}

            {/* Completion Checkbox - Bottom Right */}
            <motion.div
              className="cursor-pointer"
              whileHover={{ scale: 1.15, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete(task.id);
              }}
              title={task.completed ? "Mark as incomplete" : "Mark as complete"}
            >
              {task.completed ? (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <CheckCircle2 className="h-5 w-5 text-green-400 drop-shadow-sm" />
                </motion.div>
              ) : (
                <Circle className="h-5 w-5 text-white/60 group-hover:text-white/90 transition-colors duration-300 drop-shadow-sm" />
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
