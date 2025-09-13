import React from 'react';
import { CheckCircle2, Circle, Plus } from 'lucide-react';
import { Button } from '@/shared/ui/button';

interface PriorityTasksSectionProps {
  // Add props as needed for priority tasks functionality
}

export const PriorityTasksSection: React.FC<PriorityTasksSectionProps> = () => {
  return (
    <section className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5 rounded-2xl blur-sm"></div>
      <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-red-500/20 shadow-lg shadow-red-500/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
              Priority Tasks
            </h2>
            <p className="text-red-200/80 text-sm font-medium">
              Focus on what matters most
            </p>
          </div>
          <Button
            size="sm"
            className="bg-red-500/20 border border-red-400/50 text-red-300 hover:bg-red-500/30 hover:border-red-400/70 px-4 py-2"
            onClick={() => console.log('Edit priorities')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Priority
          </Button>
        </div>
        
        {/* Priority Task Cards */}
        <div className="space-y-3">
          {[
            { id: '1', title: 'Complete quarterly review', priority: 'high', dueDate: 'Today', completed: false },
            { id: '2', title: 'Finish client presentation', priority: 'high', dueDate: 'Tomorrow', completed: false },
            { id: '3', title: 'Review team feedback', priority: 'medium', dueDate: 'This week', completed: true },
          ].map((task) => (
            <div key={task.id} className="flex items-center justify-between p-4 bg-gray-800/40 rounded-lg border border-gray-700/50 hover:border-red-400/30 transition-all duration-200">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  task.priority === 'high' ? 'bg-red-400' : task.priority === 'medium' ? 'bg-amber-400' : 'bg-blue-400'
                }`} />
                <div>
                  <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                    {task.title}
                  </h3>
                  <p className="text-xs text-gray-400">{task.dueDate}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {task.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};