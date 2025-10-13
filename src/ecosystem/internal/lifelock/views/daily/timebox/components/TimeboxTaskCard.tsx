import React from 'react';
import { motion } from 'framer-motion';
import { Circle, CheckCircle2, Plus } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { TimeboxTask, TaskPosition } from '../types';
import { getCategoryStyles } from '../utils';

interface TimeboxTaskCardProps {
  task: TimeboxTask;
  position: TaskPosition;
  currentTimePosition: number;
  draggingTaskId: string | null;
  swipingTaskId: string | null;
  swipeDirection: 'left' | 'right' | null;
  index: number;
  onToggleComplete: (taskId: string) => void;
  onAddAfter: (task: TimeboxTask, minutes: number) => void;
  onDragStart: (taskId: string) => void;
  onDrag: (taskId: string, info: any) => void;
  onDragEnd: (taskId: string, info: any) => void;
  onPan: (taskId: string, info: any) => void;
  onPanEnd: (taskId: string, info: any) => void;
  onTaskClick: (task: TimeboxTask) => void;
  onTaskDoubleClick: (task: TimeboxTask) => void;
}

export const TimeboxTaskCard: React.FC<TimeboxTaskCardProps> = ({
  task,
  position,
  currentTimePosition,
  draggingTaskId,
  swipingTaskId,
  swipeDirection,
  index,
  onToggleComplete,
  onAddAfter,
  onDragStart,
  onDrag,
  onDragEnd,
  onPan,
  onPanEnd,
  onTaskClick,
  onTaskDoubleClick
}) => {
  const categoryStyles = getCategoryStyles(task.category, task.completed);

  return (
    <motion.div
      key={task.id}
      drag={draggingTaskId === task.id ? "y" : false}
      dragConstraints={{ top: -position.top, bottom: (23 * 80) - position.top - position.height }}
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
        draggingTaskId === task.id && "scale-105 shadow-2xl ring-2 ring-blue-400/50 z-50",
        task.completed
          ? "bg-gradient-to-br from-green-900/40 via-emerald-900/30 to-green-800/40"
          : task.color,
        categoryStyles.border,
        categoryStyles.shadow,
        categoryStyles.glow,
        !task.completed && categoryStyles.accent
      )}
      style={{
        top: `${position.top}px`,
        height: `${position.height - 4}px`,
        marginTop: '2px',
        left: '4px',
        right: '4px',
        width: 'calc(100% - 8px)'
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
            "0 0 20px rgba(168, 85, 247, 0.3)",
            "0 0 30px rgba(168, 85, 247, 0.5)",
            "0 0 20px rgba(168, 85, 247, 0.3)"
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
      <div className="p-3 h-full flex flex-col justify-between relative overflow-hidden">
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

        {/* Task header section - Compact & Clean */}
        <div className="relative z-10 mb-auto space-y-2">
          {/* Compact Top Row: Title + Checkbox + Duration Badge */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className={cn(
                "font-semibold text-sm leading-snug transition-all duration-300 group-hover:text-white",
                task.completed ? "text-green-100 line-through decoration-2 decoration-green-400/60" : "text-white"
              )}>
                {task.title}
              </h4>
              {/* Time slot in tiny text */}
              <p className="text-[10px] text-white/50 mt-0.5 font-medium">
                {task.startTime} - {task.endTime}
              </p>
            </div>

            {/* Duration bubble - Small & Compact */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap flex-shrink-0",
                task.completed
                  ? "bg-green-500/30 text-green-200 border border-green-400/50"
                  : "bg-white/25 text-white border border-white/40"
              )}
            >
              {task.duration}m
            </motion.div>

            {/* Add After button */}
            <motion.button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddAfter(task, 60);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1 rounded-full bg-white/20 hover:bg-white/30 border border-white/40 transition-colors flex-shrink-0"
              title="Add follow-up block"
            >
              <Plus className="h-3 w-3 text-white" />
            </motion.button>

            {/* Completion Checkbox */}
            <motion.div
              className="flex-shrink-0 cursor-pointer"
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

          {/* Description in Subtle Box - Only if exists and card is tall enough */}
          {task.description && task.duration >= 45 && (
            <div className="bg-black/20 border border-white/10 rounded-lg px-2 py-1.5 mt-1">
              <p className={cn(
                "text-[10px] leading-relaxed transition-all duration-300 line-clamp-2",
                task.completed ? "text-green-200/70" : "text-white/60 group-hover:text-white/75"
              )}>
                {task.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
