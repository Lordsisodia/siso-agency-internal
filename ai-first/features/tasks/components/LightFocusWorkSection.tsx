import React, { useState, useEffect } from 'react';
import { 
  Coffee,
  Plus,
  Check,
  Clock,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

// Simple block-style task management for light work sessions

interface Task {
  id: string;
  title: string;
  completed: boolean;
  timeEstimate: string;
}

interface LightFocusWorkSectionProps {
  selectedDate: Date;
}

export const LightFocusWorkSection: React.FC<LightFocusWorkSectionProps> = ({
  selectedDate
}) => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Review and respond to emails', completed: true, timeEstimate: '15 min' },
    { id: '2', title: 'Update project documentation', completed: false, timeEstimate: '30 min' },
    { id: '3', title: 'Schedule team check-in meetings', completed: false, timeEstimate: '20 min' },
    { id: '4', title: 'Organize workspace and files', completed: false, timeEstimate: '25 min' },
  ]);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const addTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: 'New light work task',
      completed: false,
      timeEstimate: '20 min'
    };
    setTasks([...tasks, newTask]);
  };

  return (
    <div className="min-h-screen w-full bg-gray-900">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-6">
        
        {/* Light Work Card */}
        <Card className="bg-green-900/20 border-green-700/50">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center text-green-400 text-base sm:text-lg">
              <Coffee className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              ☕ Light Work Sessions
            </CardTitle>
            <div className="border-t border-green-600/50 my-4"></div>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-green-300 mb-2 text-sm sm:text-base">Momentum Building</h3>
                <p className="text-gray-200 text-xs sm:text-sm leading-relaxed">
                  Light work sessions are perfect for administrative tasks, quick wins, and maintaining momentum 
                  when your energy is lower or when you need a mental break from deep focus work.
                </p>
              </div>
              <div className="border-t border-green-600/50 my-4"></div>
              <div>
                <h3 className="font-bold text-green-300 mb-2 text-sm sm:text-base">Light Work Rules</h3>
                <ul className="text-gray-200 text-xs sm:text-sm space-y-1">
                  <li>• Perfect for lower energy periods.</li>
                  <li>• Focus on quick wins and administrative tasks.</li>
                  <li>• Keep sessions between 20-45 minutes.</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-green-600/50 my-3 sm:my-4"></div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            
            {/* Quick Add Task */}
            <div className="mb-6">
              <button
                onClick={addTask}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
              >
                <Plus className="h-4 w-4" />
                Add Light Work Task
              </button>
            </div>

            {/* Task Blocks */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`
                    p-4 rounded-lg border transition-all duration-200 cursor-pointer
                    ${task.completed 
                      ? 'bg-green-900/20 border-green-700/50 text-green-100' 
                      : 'bg-gray-800/50 border-gray-700/50 text-gray-100 hover:border-green-600/50 hover:bg-gray-800/70'
                    }
                  `}
                  onClick={() => toggleTask(task.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {task.completed ? (
                        <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-400 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      {task.timeEstimate}
                    </div>
                  </div>
                  
                  <h3 className={`text-sm font-medium leading-tight ${
                    task.completed ? 'line-through text-green-300/80' : ''
                  }`}>
                    {task.title}
                  </h3>
                  
                  <div className="mt-3 pt-2 border-t border-current/10">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Target className="h-3 w-3" />
                      Light Work Session
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Session Stats */}
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
                <div className="text-2xl font-bold text-green-400">
                  {tasks.filter(t => t.completed).length}
                </div>
                <div className="text-xs text-gray-400 mt-1">Completed</div>
              </div>
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
                <div className="text-2xl font-bold text-blue-400">
                  {tasks.filter(t => !t.completed).length}
                </div>
                <div className="text-xs text-gray-400 mt-1">Remaining</div>
              </div>
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
                <div className="text-2xl font-bold text-yellow-400">
                  {tasks.length}
                </div>
                <div className="text-xs text-gray-400 mt-1">Total Tasks</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
};