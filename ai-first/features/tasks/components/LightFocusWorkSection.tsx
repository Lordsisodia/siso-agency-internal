import React, { useState, useMemo } from 'react';
import { 
  Coffee,
  Plus,
  Check,
  Clock,
  Target,
  ChevronDown,
  ChevronRight,
  X,
  Edit,
  Zap,
  Brain,
  Settings,
  Loader2,
  Database
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedDateHeader } from '@/components/ui/animated-date-header-v2';
import { format } from 'date-fns';
import { PersonalContextModal } from './PersonalContextModal';
import { useTaskDatabase } from '@/ai-first/hooks/useTaskDatabase';

interface LightFocusWorkSectionProps {
  selectedDate: Date;
  onPreviousDate?: () => void;
  onNextDate?: () => void;
}

export const LightFocusWorkSection: React.FC<LightFocusWorkSectionProps> = ({
  selectedDate,
  onPreviousDate,
  onNextDate
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskEstimate, setNewTaskEstimate] = useState('30 min');
  const [showPersonalContextModal, setShowPersonalContextModal] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [newSubtaskTitles, setNewSubtaskTitles] = useState<{[key: string]: string}>({});

  // Use the database hook
  const {
    tasks,
    loading,
    error,
    personalContext,
    createTask,
    toggleTaskCompletion,
    toggleSubtaskCompletion,
    analyzeTaskWithAI,
    analyzeSubtaskWithAI,
    updatePersonalContext,
    addSubtask,
    deleteTask
  } = useTaskDatabase({ selectedDate });

  // Parse time estimates for calculations
  const parseTimeEstimate = (timeStr: string): number => {
    const match = timeStr.match(/(\d+)\s*(min|hour|h)/i);
    if (!match) return 20;
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    return unit.includes('h') ? value * 60 : value;
  };

  // Calculate total XP and progress
  const stats = useMemo(() => {
    let totalXP = 0;
    let earnedXP = 0;
    let completedTasks = 0;
    let totalTasks = 0;

    tasks.forEach(task => {
      totalTasks++;
      if (task.completed) {
        completedTasks++;
        earnedXP += task.xpReward || 0;
      }
      totalXP += task.xpReward || 0;

      task.subtasks.forEach(subtask => {
        if (subtask.completed) {
          earnedXP += subtask.xpReward || 0;
        }
        totalXP += subtask.xpReward || 0;
      });
    });

    const remainingXP = totalXP - earnedXP;
    
    return {
      totalXP,
      earnedXP,
      remainingXP,
      completedTasks,
      totalTasks,
      completionPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  }, [tasks]);

  // Handle new task creation
  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      await createTask({
        title: newTaskTitle.trim(),
        workType: 'LIGHT',
        priority: 'MEDIUM',
        currentDate: format(selectedDate, 'yyyy-MM-dd'),
        timeEstimate: newTaskEstimate,
        estimatedDuration: parseTimeEstimate(newTaskEstimate)
      });

      setNewTaskTitle('');
      setNewTaskEstimate('30 min');
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  // Handle adding subtask
  const handleAddSubtask = async (taskId: string) => {
    const title = newSubtaskTitles[taskId];
    if (!title?.trim()) return;

    try {
      await addSubtask(taskId, title.trim());
      setNewSubtaskTitles(prev => ({ ...prev, [taskId]: '' }));
    } catch (error) {
      console.error('Failed to add subtask:', error);
    }
  };

  // Toggle task expansion
  const toggleTaskExpanded = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  // Get XP badge color based on amount
  const getXPBadgeColor = (xp: number) => {
    if (xp >= 150) return 'bg-purple-500';
    if (xp >= 100) return 'bg-blue-500';
    if (xp >= 50) return 'bg-green-500';
    if (xp >= 25) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  // Get difficulty badge color
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'expert': return 'text-red-400 bg-red-900/20';
      case 'hard': return 'text-orange-400 bg-orange-900/20';
      case 'moderate': return 'text-yellow-400 bg-yellow-900/20';
      case 'easy': return 'text-green-400 bg-green-900/20';
      case 'trivial': return 'text-gray-400 bg-gray-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 pb-24">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3 text-white">
            <Loader2 className="w-6 h-6 animate-spin" />
            <Database className="w-6 h-6 text-blue-400" />
            <span>Loading tasks from database...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 pb-24">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <X className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Database Error</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 pb-24">
      {/* Header */}
      <AnimatedDateHeader 
        selectedDate={selectedDate}
        earnedXP={stats.earnedXP}
        potentialXP={stats.remainingXP}
        currentLevel={Math.floor(stats.earnedXP / 100) + 1}
        streakDays={3}
        badgeCount={1}
        className="mb-6"
        onPreviousDate={onPreviousDate}
        onNextDate={onNextDate}
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Light Work Header */}
        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Coffee className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white">Light Focus Work</CardTitle>
                  <p className="text-gray-400 text-sm">
                    Quick tasks and administrative work • {format(selectedDate, 'EEEE, MMMM d')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPersonalContextModal(true)}
                className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors"
                title="Personal Context for AI Analysis"
              >
                <Settings className="w-5 h-5 text-blue-400" />
              </button>
            </div>
          </CardHeader>
        </Card>

        {/* Progress Stats */}
        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.earnedXP}</div>
                <div className="text-xs text-gray-400">Earned XP</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{stats.remainingXP}</div>
                <div className="text-xs text-gray-400">Potential XP</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{stats.completedTasks}/{stats.totalTasks}</div>
                <div className="text-xs text-gray-400">Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">{stats.completionPercentage}%</div>
                <div className="text-xs text-gray-400">Complete</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add New Task */}
        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Add a new light work task..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
              />
              <select
                value={newTaskEstimate}
                onChange={(e) => setNewTaskEstimate(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
              >
                <option value="15 min">15 min</option>
                <option value="30 min">30 min</option>
                <option value="45 min">45 min</option>
                <option value="1 hour">1 hour</option>
              </select>
              <button
                onClick={handleAddTask}
                disabled={!newTaskTitle.trim()}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <div className="space-y-3">
          {tasks.map((task) => (
            <Card key={task.id} className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Completion Checkbox */}
                  <button
                    onClick={() => toggleTaskCompletion(task.id)}
                    className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      task.completed
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'border-gray-400 hover:border-green-500'
                    }`}
                  >
                    {task.completed && <Check className="w-3 h-3" />}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`text-lg font-medium ${
                        task.completed ? 'text-gray-400 line-through' : 'text-white'
                      }`}>
                        {task.title}
                      </h3>
                      
                      {/* Time Estimate */}
                      <div className="flex items-center gap-1 text-gray-400 text-sm">
                        <Clock className="w-4 h-4" />
                        {task.timeEstimate}
                      </div>

                      {/* XP Badge */}
                      {task.xpReward && (
                        <div className={`px-2 py-1 rounded text-xs font-medium text-white ${getXPBadgeColor(task.xpReward)}`}>
                          {task.xpReward} XP
                        </div>
                      )}

                      {/* Difficulty Badge */}
                      {task.difficulty && (
                        <div className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(task.difficulty)}`}>
                          {task.difficulty}
                        </div>
                      )}

                      {/* Priority Rank */}
                      {task.priorityRank && (
                        <div className="flex items-center gap-1 text-yellow-400 text-sm">
                          <Target className="w-4 h-4" />
                          #{task.priorityRank}
                        </div>
                      )}
                    </div>

                    {/* Subtasks */}
                    {task.subtasks.length > 0 && (
                      <div className="ml-4 space-y-2">
                        {task.subtasks.map((subtask) => (
                          <div key={subtask.id} className="flex items-center gap-3">
                            <button
                              onClick={() => toggleSubtaskCompletion(task.id, subtask.id)}
                              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                subtask.completed
                                  ? 'bg-green-600 border-green-600 text-white'
                                  : 'border-gray-400 hover:border-green-500'
                              }`}
                            >
                              {subtask.completed && <Check className="w-2 h-2" />}
                            </button>
                            
                            <span className={`text-sm flex-1 ${
                              subtask.completed ? 'text-gray-400 line-through' : 'text-gray-300'
                            }`}>
                              {subtask.title}
                            </span>

                            {/* Subtask XP */}
                            {subtask.xpReward && (
                              <div className={`px-1.5 py-0.5 rounded text-xs font-medium text-white ${getXPBadgeColor(subtask.xpReward)}`}>
                                {subtask.xpReward} XP
                              </div>
                            )}

                            {/* AI Analysis Button */}
                            <button
                              onClick={() => analyzeSubtaskWithAI(task.id, subtask.id)}
                              className={`p-1 rounded transition-colors ${
                                subtask.aiAnalyzed 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                              }`}
                              title={subtask.aiAnalyzed ? 'Re-analyze with AI' : 'Analyze with AI'}
                            >
                              {subtask.aiAnalyzed ? <Zap className="w-3 h-3" /> : <Brain className="w-3 h-3" />}
                            </button>
                          </div>
                        ))}
                        
                        {/* Add Subtask */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Add subtask..."
                            value={newSubtaskTitles[task.id] || ''}
                            onChange={(e) => setNewSubtaskTitles(prev => ({
                              ...prev,
                              [task.id]: e.target.value
                            }))}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask(task.id)}
                            className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                          />
                          <button
                            onClick={() => handleAddSubtask(task.id)}
                            disabled={!newSubtaskTitles[task.id]?.trim()}
                            className="px-2 py-1 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Add subtasks if none exist */}
                    {task.subtasks.length === 0 && (
                      <div className="ml-4 mt-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Add first subtask..."
                            value={newSubtaskTitles[task.id] || ''}
                            onChange={(e) => setNewSubtaskTitles(prev => ({
                              ...prev,
                              [task.id]: e.target.value
                            }))}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask(task.id)}
                            className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                          />
                          <button
                            onClick={() => handleAddSubtask(task.id)}
                            disabled={!newSubtaskTitles[task.id]?.trim()}
                            className="px-2 py-1 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Task Actions */}
                  <div className="flex items-center gap-2">
                    {/* AI Analysis Button */}
                    <button
                      onClick={() => analyzeTaskWithAI(task.id)}
                      className={`p-2 rounded transition-colors ${
                        task.aiAnalyzed 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                      }`}
                      title={task.aiAnalyzed ? 'Re-analyze with AI' : 'Analyze with AI'}
                    >
                      {task.aiAnalyzed ? <Zap className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                      title="Delete task"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {tasks.length === 0 && (
          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <Coffee className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Light Work Tasks Yet</h3>
              <p className="text-gray-400 mb-4">
                Add some quick tasks, administrative work, or other light focus activities.
              </p>
              <button
                onClick={() => document.querySelector('input[placeholder*="Add a new"]')?.focus()}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors"
              >
                Add Your First Task
              </button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Personal Context Modal */}
      {showPersonalContextModal && (
        <PersonalContextModal
          isOpen={showPersonalContextModal}
          onClose={() => setShowPersonalContextModal(false)}
          onSave={updatePersonalContext}
        />
      )}
    </div>
  );
};