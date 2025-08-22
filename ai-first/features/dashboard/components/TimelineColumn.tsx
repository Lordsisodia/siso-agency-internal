import React, { useState } from 'react';
import { Task } from '@/types/task.types';
import { TaskCard } from './TaskCard';
import { useTimeWindow } from '@/hooks/useTimeWindow';
import { useCheckInOut } from '@/hooks/useCheckInOut';
import { CheckInOutDialog } from './CheckInOutDialog';
import { TimelineRuler } from './timeline/TimelineRuler';
import { TimeIndicator } from './timeline/TimeIndicator';
import { RoutineCard } from './timeline/RoutineCard';
import { TaskCreationDialog } from './TaskCreationDialog';
import { TimelineHeader } from './timeline/TimelineHeader';
import { TimelineGrid } from './timeline/TimelineGrid';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTaskDragDrop } from '@/hooks/useTaskDragDrop';

export function TimelineColumn({ tasks }: { tasks: Task[] }) {
  const { currentTime, timelineRef, getCurrentWindow, scrollToCurrentTime } = useTimeWindow();
  const { handleDrop, handleDragOver, isDragging } = useTaskDragDrop();
  const { 
    morningCheckInTime, 
    eveningCheckOutTime,
    shouldShowMorningCheckIn,
    shouldShowEveningCheckOut,
    handleMorningCheckIn,
    handleEveningCheckOut,
    checkInStatus,
    checkOutStatus
  } = useCheckInOut();

  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [checkOutDialogOpen, setCheckOutDialogOpen] = useState(false);
  const [taskCreationOpen, setTaskCreationOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number | undefined>(undefined);

  const handleCreateTask = (hour?: number) => {
    setSelectedHour(hour);
    setTaskCreationOpen(true);
  };
  
  const handleTimeSlotClick = (hour: number) => {
    handleCreateTask(hour);
  };

  const allTasks = [...tasks].sort((a, b) => {
    if (!a.start_time || !b.start_time) return 0;
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
  });

  return (
    <div className="flex flex-col h-full">
      <TimelineHeader 
        onCreateTask={() => handleCreateTask()}
        currentDate={currentTime}
        className="p-4"
      />
      
      <div className="flex-1 relative">
        <ScrollArea 
          ref={timelineRef}
          className="h-[calc(100vh-13rem)]"
          onDragOver={handleDragOver}
          onDrop={(e) => {
            if (timelineRef.current) {
              handleDrop(e, timelineRef.current);
            }
          }}
        >
          <div className="relative min-h-[2400px]" style={{ paddingLeft: '4rem' }}>
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-background/80 backdrop-blur z-10">
              <TimelineRuler 
                currentHour={currentTime.getHours()} 
                hourHeight={100}
                onTimeSlotClick={handleTimeSlotClick}
              />
            </div>

            <div className="relative pl-4 pr-4">
              <TimelineGrid hourHeight={100} />
              
              <TimeIndicator 
                currentTime={currentTime} 
                position={currentTime.getHours() * 100 + (currentTime.getMinutes() / 60) * 100} 
              />
              
              {isDragging && (
                <div
                  id="dragGuideLine"
                  className="absolute left-0 right-0 h-0.5 bg-purple-500/50 pointer-events-none hidden"
                  style={{ zIndex: 20 }}
                />
              )}
              
              {shouldShowMorningCheckIn() && (
                <RoutineCard
                  type="morning"
                  time={morningCheckInTime}
                  status={checkInStatus}
                  onClick={() => setCheckInDialogOpen(true)}
                />
              )}
              
              {shouldShowEveningCheckOut() && (
                <RoutineCard
                  type="evening"
                  time={eveningCheckOutTime}
                  status={checkOutStatus}
                  onClick={() => setCheckOutDialogOpen(true)}
                />
              )}

              <div className="absolute inset-0">
                {allTasks.map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task}
                    currentHour={currentTime.getHours()}
                    allTasks={allTasks}
                  />
                ))}
              </div>

              {allTasks.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center h-[600px]">
                  <div className="text-center p-6 max-w-xs mx-auto">
                    <div className="rounded-full bg-gray-100 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                      <Plus className="h-6 w-6 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No tasks scheduled</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Click on a time slot or use the create button to add tasks to your schedule
                    </p>
                    <Button onClick={() => handleCreateTask()}>
                      Create Task
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>

      <CheckInOutDialog
        type="check-in"
        open={checkInDialogOpen}
        onOpenChange={setCheckInDialogOpen}
        onComplete={handleMorningCheckIn}
        time={morningCheckInTime}
      />
      
      <CheckInOutDialog
        type="check-out"
        open={checkOutDialogOpen}
        onOpenChange={setCheckOutDialogOpen}
        onComplete={handleEveningCheckOut}
        time={eveningCheckOutTime}
      />
      
      <TaskCreationDialog
        isOpen={taskCreationOpen}
        onClose={() => setTaskCreationOpen(false)}
        initialHour={selectedHour}
      />
    </div>
  );
}
