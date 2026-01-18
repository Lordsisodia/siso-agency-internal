import React from 'react';
import { ClientData } from '@/types/client.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, User, Calendar, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ClientTasksListProps {
  client: ClientData;
}

export function ClientTasksList({ client }: ClientTasksListProps) {
  const todos = client.todos || [];
  const completedTasks = todos.filter(todo => todo.completed);
  const pendingTasks = todos.filter(todo => !todo.completed);

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 border-red-500/40 shadow-red-500/20';
      case 'medium': return 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-300 border-orange-500/40 shadow-orange-500/20';
      case 'low': return 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-300 border-gray-500/40 shadow-gray-500/20';
      default: return 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-300 border-orange-500/40 shadow-orange-500/20';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return <AlertCircle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Black & Orange Task Summary */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-gray-900/60 to-black/40 border-orange-500/30 shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/20 rounded-xl backdrop-blur-sm border border-orange-400/30">
                <Clock className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-orange-200/80 font-medium">Pending Tasks</p>
                <p className="text-3xl font-bold text-white mt-1">{pendingTasks.length}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-orange-400" />
                  <span className="text-xs text-orange-300">Active</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900/60 to-black/40 border-orange-500/30 shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/20 rounded-xl backdrop-blur-sm border border-orange-400/30">
                <CheckCircle className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-orange-200/80 font-medium">Completed</p>
                <p className="text-3xl font-bold text-white mt-1">{completedTasks.length}</p>
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle className="w-3 h-3 text-orange-400" />
                  <span className="text-xs text-orange-300">Done</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900/60 to-black/40 border-orange-500/30 shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/20 rounded-xl backdrop-blur-sm border border-orange-400/30">
                <AlertCircle className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-orange-200/80 font-medium">Total Tasks</p>
                <p className="text-3xl font-bold text-white mt-1">{todos.length}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-orange-400" />
                  <span className="text-xs text-orange-300">Overall</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Black & Orange Pending Tasks */}
      {pendingTasks.length > 0 && (
        <Card className="bg-gradient-to-br from-gray-900/60 to-black/40 border-orange-700/50 shadow-xl backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-white text-xl">
              <div className="p-2 bg-orange-500/20 rounded-lg backdrop-blur-sm border border-orange-400/30">
                <Clock className="w-5 h-5 text-orange-400" />
              </div>
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                Pending Tasks ({pendingTasks.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingTasks.map((todo) => (
              <div key={todo.id} className="group p-5 bg-gradient-to-r from-gray-800/60 to-black/40 rounded-xl border border-orange-700/30 backdrop-blur-sm hover:border-orange-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-900/20">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-white text-lg group-hover:text-orange-200 transition-colors">
                        {todo.text}
                      </h3>
                      <Badge className={`border shadow-sm ${getPriorityColor(todo.priority || 'medium')}`}>
                        <span className="flex items-center gap-1.5 font-medium">
                          {getPriorityIcon(todo.priority || 'medium')}
                          {todo.priority || 'Medium'}
                        </span>
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-300">
                      {todo.assigned_to && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-900/20 rounded-lg backdrop-blur-sm border border-orange-600/30">
                          <User className="w-4 h-4 text-orange-400" />
                          <span className="font-medium text-orange-300">{todo.assigned_to}</span>
                        </div>
                      )}
                      {todo.due_date && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-900/20 rounded-lg backdrop-blur-sm border border-orange-600/30">
                          <Calendar className="w-4 h-4 text-orange-400" />
                          <span className="font-medium text-orange-300">
                            Due {formatDistanceToNow(new Date(todo.due_date), { addSuffix: true })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Black & Orange Completed Tasks */}
      {completedTasks.length > 0 && (
        <Card className="bg-gradient-to-br from-gray-900/60 to-black/40 border-orange-700/50 shadow-xl backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-white text-xl">
              <div className="p-2 bg-orange-500/20 rounded-lg backdrop-blur-sm border border-orange-400/30">
                <CheckCircle className="w-5 h-5 text-orange-400" />
              </div>
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                Completed Tasks ({completedTasks.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {completedTasks.map((todo) => (
              <div key={todo.id} className="group p-5 bg-gradient-to-r from-gray-800/60 to-black/40 rounded-xl border border-orange-700/30 backdrop-blur-sm opacity-90 hover:opacity-100 transition-all duration-300">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                      <h3 className="font-semibold text-white line-through decoration-orange-500/50 text-lg">
                        {todo.text}
                      </h3>
                      <Badge variant="outline" className="text-orange-300 border-orange-500/40 bg-orange-500/10 shadow-orange-500/20">
                        ✓ Completed
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      {todo.assigned_to && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-700/20 rounded-lg backdrop-blur-sm border border-orange-600/30">
                          <User className="w-4 h-4 text-orange-400" />
                          <span className="font-medium text-orange-300">{todo.assigned_to}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Black & Orange No Tasks Message */}
      {todos.length === 0 && (
        <Card className="bg-gradient-to-br from-gray-900/60 to-black/40 border-orange-700/50 shadow-xl backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <div className="mb-6">
              <div className="inline-flex p-4 bg-orange-600/20 rounded-2xl backdrop-blur-sm border border-orange-500/30">
                <Clock className="w-12 h-12 text-orange-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">No Tasks Yet</h3>
            <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
              Tasks and todos will appear here as they are created for this client. 
              Start by adding your first task to track project progress.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
