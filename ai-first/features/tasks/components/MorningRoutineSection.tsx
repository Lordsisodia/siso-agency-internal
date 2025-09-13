'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, isToday } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { Input } from '@/shared/ui/input';
import { cn } from '@/shared/lib/utils';
import { useClerkUser } from '@/shared/ClerkProvider';
import { workTypeApiClient } from '@/services/workTypeApiClient';

interface Task {
  id: string;
  title: string;
  type: 'simple' | 'input' | 'subtask' | 'timer';
  completed: boolean;
  inputValue?: string;
  placeholder?: string;
  subtasks?: {
    id: string;
    title: string;
    completed: boolean;
    count?: number;
    targetCount?: number;
  }[];
}

const morningTasks: Task[] = [
  {
    id: 'wakeup',
    title: 'Wake Up',
    type: 'input',
    completed: false,
    placeholder: 'What time did you wake up?'
  },
  {
    id: 'getbloodflowing',
    title: 'Get Blood Flowing',
    type: 'subtask',
    completed: false,
    subtasks: [
      { id: 'pushups', title: 'Pushups', completed: false, count: 0, targetCount: 10 },
      { id: 'situps', title: 'Situps', completed: false, count: 0, targetCount: 20 },
      { id: 'pullups', title: 'Pullups', completed: false, count: 0, targetCount: 5 }
    ]
  },
  {
    id: 'freshenup',
    title: 'Freshen Up',
    type: 'subtask',
    completed: false,
    subtasks: [
      { id: 'bathroom', title: 'Bathroom', completed: false },
      { id: 'brushteeth', title: 'Brush Teeth', completed: false },
      { id: 'coldshower', title: 'Cold Shower', completed: false }
    ]
  },
  {
    id: 'powerupbrain',
    title: 'Power Up Brain',
    type: 'subtask',
    completed: false,
    subtasks: [
      { id: 'water', title: 'Drink Water', completed: false },
      { id: 'supplements', title: 'Supplements', completed: false },
      { id: 'preworkout', title: 'Pre-workout', completed: false }
    ]
  },
  {
    id: 'planday',
    title: 'Plan Day',
    type: 'subtask',
    completed: false,
    subtasks: [
      { id: 'thoughtdump', title: 'Thought Dump (3 min)', completed: false },
      { id: 'deepwork', title: 'Plan Deep Work', completed: false },
      { id: 'lightwork', title: 'Plan Light Work', completed: false },
      { id: 'timebox', title: 'Set Time Box', completed: false }
    ]
  },
  {
    id: 'meditation',
    title: 'Meditation',
    type: 'timer',
    completed: false
  }
];

export function MorningRoutineSection() {
  const [tasks, setTasks] = useState<Task[]>(morningTasks);
  const [wakeUpTime, setWakeUpTime] = useState<string>('');
  const [meditationTime, setMeditationTime] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [completedRoutine, setCompletedRoutine] = useState(false);
  const { user } = useClerkUser();

  // Load saved data on mount
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const savedData = localStorage.getItem(`morningRoutine-${today}`);
    
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setTasks(parsed.tasks || morningTasks);
      setWakeUpTime(parsed.wakeUpTime || '');
      setCompletedRoutine(parsed.completedRoutine || false);
    }
  }, []);

  // Save data whenever tasks change
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const dataToSave = {
      tasks,
      wakeUpTime,
      completedRoutine,
      date: today
    };
    localStorage.setItem(`morningRoutine-${today}`, JSON.stringify(dataToSave));
  }, [tasks, wakeUpTime, completedRoutine]);

  // Timer effect for meditation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setMeditationTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTaskToggle = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return { ...task, completed: !task.completed };
      }
      return task;
    }));
  };

  const handleSubtaskToggle = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId && task.subtasks) {
        const updatedSubtasks = task.subtasks.map(subtask => 
          subtask.id === subtaskId 
            ? { ...subtask, completed: !subtask.completed }
            : subtask
        );
        
        // Auto-complete main task if all subtasks are done
        const allSubtasksComplete = updatedSubtasks.every(subtask => subtask.completed);
        
        return {
          ...task,
          subtasks: updatedSubtasks,
          completed: allSubtasksComplete
        };
      }
      return task;
    }));
  };

  const handleCountChange = (taskId: string, subtaskId: string, count: number) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId && task.subtasks) {
        const updatedSubtasks = task.subtasks.map(subtask => {
          if (subtask.id === subtaskId) {
            const completed = subtask.targetCount ? count >= subtask.targetCount : false;
            return { ...subtask, count, completed };
          }
          return subtask;
        });

        // Auto-complete main task if all subtasks are done
        const allSubtasksComplete = updatedSubtasks.every(subtask => subtask.completed);
        
        return {
          ...task,
          subtasks: updatedSubtasks,
          completed: allSubtasksComplete
        };
      }
      return task;
    }));
  };

  const handleWakeUpTimeChange = (value: string) => {
    setWakeUpTime(value);
    
    // Auto-complete wake up task if time is entered
    setTasks(prev => prev.map(task => 
      task.id === 'wakeup' 
        ? { ...task, completed: value.length > 0, inputValue: value }
        : task
    ));
  };

  const handleMeditationToggle = () => {
    const meditationTask = tasks.find(task => task.id === 'meditation');
    
    if (!meditationTask?.completed) {
      setIsTimerRunning(!isTimerRunning);
    } else {
      // Reset meditation
      setMeditationTime(0);
      setIsTimerRunning(false);
      setTasks(prev => prev.map(task => 
        task.id === 'meditation' 
          ? { ...task, completed: false }
          : task
      ));
    }
  };

  const completeMeditation = () => {
    setIsTimerRunning(false);
    setTasks(prev => prev.map(task => 
      task.id === 'meditation' 
        ? { ...task, completed: true }
        : task
    ));
  };

  const completeRoutine = async () => {
    const allTasksComplete = tasks.every(task => task.completed);
    
    if (!allTasksComplete) {
      alert('Please complete all tasks before finishing your routine!');
      return;
    }

    try {
      setCompletedRoutine(true);
      
      // Optional: Send completion data to API
      if (user) {
        await workTypeApiClient.logMorningRoutine({
          userId: user.id,
          completedAt: new Date().toISOString(),
          wakeUpTime,
          meditationDuration: meditationTime,
          tasks: tasks.map(task => ({
            id: task.id,
            title: task.title,
            completed: task.completed,
            subtasks: task.subtasks?.map(st => ({
              id: st.id,
              title: st.title,
              completed: st.completed,
              count: st.count
            }))
          }))
        });
      }
    } catch (error) {
      console.error('Error logging morning routine:', error);
    }
  };

  const resetRoutine = () => {
    setTasks(morningTasks);
    setWakeUpTime('');
    setMeditationTime(0);
    setIsTimerRunning(false);
    setCompletedRoutine(false);
  };

  const completedTasksCount = tasks.filter(task => task.completed).length;
  const progress = (completedTasksCount / tasks.length) * 100;

  const today = new Date();
  const isCurrentDay = isToday(today);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span>🌅</span>
              Morning Routine
              <span className="text-sm font-normal text-muted-foreground">
                {format(today, 'EEEE, MMMM do')}
              </span>
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-full bg-secondary rounded-full h-2">
                <motion.div
                  className="h-2 bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-sm text-muted-foreground">
                {completedTasksCount}/{tasks.length}
              </span>
            </div>
          </div>
          
          {completedRoutine && (
            <div className="text-green-600 font-semibold flex items-center gap-2">
              <span>✅</span>
              Routine Complete!
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-4 border rounded-lg transition-all",
              task.completed ? "bg-green-50 border-green-200" : "bg-background"
            )}
          >
            {task.type === 'simple' && (
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => handleTaskToggle(task.id)}
                />
                <span className={cn(
                  "font-medium",
                  task.completed && "line-through text-muted-foreground"
                )}>
                  {task.title}
                </span>
              </div>
            )}

            {task.type === 'input' && task.id === 'wakeup' && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleTaskToggle(task.id)}
                  />
                  <span className={cn(
                    "font-medium",
                    task.completed && "line-through text-muted-foreground"
                  )}>
                    {task.title}
                  </span>
                </div>
                <Input
                  type="time"
                  value={wakeUpTime}
                  onChange={(e) => handleWakeUpTimeChange(e.target.value)}
                  className="w-48"
                  placeholder={task.placeholder}
                />
                {wakeUpTime && (
                  <p className="text-sm text-muted-foreground">
                    You woke up at {format(new Date(`2000-01-01T${wakeUpTime}`), 'h:mm a')}
                  </p>
                )}
              </div>
            )}

            {task.type === 'subtask' && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleTaskToggle(task.id)}
                  />
                  <span className={cn(
                    "font-medium",
                    task.completed && "line-through text-muted-foreground"
                  )}>
                    {task.title}
                  </span>
                </div>
                
                <div className="ml-6 space-y-2">
                  {task.subtasks?.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-3">
                      <Checkbox
                        checked={subtask.completed}
                        onCheckedChange={() => handleSubtaskToggle(task.id, subtask.id)}
                      />
                      <span className={cn(
                        "text-sm",
                        subtask.completed && "line-through text-muted-foreground"
                      )}>
                        {subtask.title}
                      </span>
                      
                      {subtask.targetCount && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={subtask.count || 0}
                            onChange={(e) => handleCountChange(
                              task.id, 
                              subtask.id, 
                              parseInt(e.target.value) || 0
                            )}
                            className="w-16 h-6"
                            min="0"
                          />
                          <span className="text-xs text-muted-foreground">
                            / {subtask.targetCount}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {task.type === 'timer' && task.id === 'meditation' && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleTaskToggle(task.id)}
                  />
                  <span className={cn(
                    "font-medium",
                    task.completed && "line-through text-muted-foreground"
                  )}>
                    {task.title}
                  </span>
                </div>
                
                <div className="ml-6 flex items-center gap-4">
                  <div className="text-2xl font-mono">
                    {formatTime(meditationTime)}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleMeditationToggle}
                      disabled={task.completed}
                    >
                      {isTimerRunning ? 'Pause' : 'Start'}
                    </Button>
                    
                    {meditationTime > 0 && !task.completed && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={completeMeditation}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}

        <div className="flex gap-4 pt-4">
          {!completedRoutine && (
            <Button
              onClick={completeRoutine}
              disabled={completedTasksCount !== tasks.length}
              className="flex-1"
            >
              Complete Morning Routine
            </Button>
          )}
          
          {(completedRoutine || !isCurrentDay) && (
            <Button
              variant="outline"
              onClick={resetRoutine}
              className="flex-1"
            >
              Reset Routine
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}