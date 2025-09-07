
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle2, Coffee, Clock, Sparkles, AlertCircle, 
  CalendarCheck, ListTodo, BrainCircuit 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SubtaskList } from './SubtaskList';

interface CheckInOutDialogProps {
  type: 'check-in' | 'check-out';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: any) => Promise<boolean>;
  time: Date;
}

const morningRoutineTasks = [
  { id: 'mr1', title: 'Review today\'s agenda', completed: false },
  { id: 'mr2', title: 'Check and respond to important emails', completed: false },
  { id: 'mr3', title: 'Update task statuses', completed: false },
  { id: 'mr4', title: 'Prepare for daily standup', completed: false },
  { id: 'mr5', title: 'Set priorities for the day', completed: false }
];

export function CheckInOutDialog({ type, open, onOpenChange, onComplete, time }: CheckInOutDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [completedTasks, setCompletedTasks] = useState('');
  const [blockers, setBlockers] = useState('');
  const [tomorrowPlan, setTomorrowPlan] = useState('');
  const [morningTasks, setMorningTasks] = useState(morningRoutineTasks);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let data;
      
      if (type === 'check-in') {
        data = { notes };
      } else {
        data = {
          completed: completedTasks.split('\n').filter(Boolean),
          blockers: blockers.split('\n').filter(Boolean),
          plan: tomorrowPlan
        };
      }
      
      const success = await onComplete(data);
      if (success) {
        // Reset form
        setNotes('');
        setCompletedTasks('');
        setBlockers('');
        setTomorrowPlan('');
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTask = (id: string) => {
    setMorningTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    // In this context, we don't actually want to delete morning routine tasks
    // But we need to provide the prop to satisfy TypeScript
    console.log('Delete task is not implemented for morning routine tasks');
  };

  const renderCheckInContent = () => (
    <>
      <DialogDescription className="flex items-center gap-2 text-green-600 font-medium mb-6">
        <Coffee className="h-5 w-5" />
        <span>Let's start your day with a productive morning routine!</span>
      </DialogDescription>
      
      <div className="space-y-4">
        <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <h4 className="font-medium flex items-center gap-2 text-amber-800 dark:text-amber-400">
            <ListTodo className="h-4 w-4" />
            Complete your morning routine tasks
          </h4>
        </div>
        
        <div className="space-y-4">
          <SubtaskList 
            subtasks={morningTasks}
            onToggle={handleToggleTask}
            onDelete={handleDeleteTask}
          />
          
          <div>
            <Label htmlFor="check-in-notes">Additional notes</Label>
            <Textarea
              id="check-in-notes"
              placeholder="Any blockers or important notes for today?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
      </div>
    </>
  );

  const renderCheckOutContent = () => (
    <>
      <DialogDescription className="flex items-center gap-2 text-purple-600 font-medium mb-6">
        <Clock className="h-5 w-5" />
        <span>Review your day before heading out!</span>
      </DialogDescription>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="completed-tasks" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            What did you accomplish today?
          </Label>
          <Textarea
            id="completed-tasks"
            placeholder="List your accomplishments..."
            value={completedTasks}
            onChange={(e) => setCompletedTasks(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        
        <div>
          <Label htmlFor="blockers" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            Any blockers or challenges?
          </Label>
          <Textarea
            id="blockers"
            placeholder="List any blockers you encountered..."
            value={blockers}
            onChange={(e) => setBlockers(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        
        <div>
          <Label htmlFor="tomorrow-plan" className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-blue-500" />
            Plan for tomorrow
          </Label>
          <Textarea
            id="tomorrow-plan"
            placeholder="What do you plan to tackle tomorrow?"
            value={tomorrowPlan}
            onChange={(e) => setTomorrowPlan(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
      </div>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {type === 'check-in' ? (
              <>
                <CalendarCheck className="h-5 w-5 text-green-500" />
                Morning Check-In
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 text-purple-500" />
                Evening Check-Out
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          {type === 'check-in' ? renderCheckInContent() : renderCheckOutContent()}
          
          <DialogFooter className="mt-6">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className={type === 'check-in' 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-purple-600 hover:bg-purple-700"
              }
            >
              {isSubmitting ? "Processing..." : type === 'check-in' ? "Start My Day" : "End My Day"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
