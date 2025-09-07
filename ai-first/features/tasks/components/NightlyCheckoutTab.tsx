import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Moon,
  CheckCircle2,
  Star,
  TrendingUp,
  Calendar,
  Target,
  Heart,
  Book,
  Lightbulb,
  Plus,
  Save
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Textarea } from '@/shared/ui/textarea';
import { Slider } from '@/shared/ui/slider';
import { TabProps } from '../DayTabContainer';

interface DayReflection {
  overallRating: number;
  accomplishments: string[];
  challenges: string;
  learnings: string;
  gratitude: string;
  tomorrowGoals: string[];
  energyLevel: number;
  focusQuality: number;
}

export const NightlyCheckoutTab: React.FC<TabProps> = ({
  user,
  todayCard,
  onOrganizeTasks,
  isAnalyzingTasks
}) => {
  const [reflection, setReflection] = useState<DayReflection>({
    overallRating: 7,
    accomplishments: [],
    challenges: '',
    learnings: '',
    gratitude: '',
    tomorrowGoals: [],
    energyLevel: 7,
    focusQuality: 6
  });

  const [newAccomplishment, setNewAccomplishment] = useState('');
  const [newGoal, setNewGoal] = useState('');

  const addAccomplishment = () => {
    if (newAccomplishment.trim()) {
      setReflection(prev => ({
        ...prev,
        accomplishments: [...prev.accomplishments, newAccomplishment.trim()]
      }));
      setNewAccomplishment('');
    }
  };

  const removeAccomplishment = (index: number) => {
    setReflection(prev => ({
      ...prev,
      accomplishments: prev.accomplishments.filter((_, i) => i !== index)
    }));
  };

  const addTomorrowGoal = () => {
    if (newGoal.trim()) {
      setReflection(prev => ({
        ...prev,
        tomorrowGoals: [...prev.tomorrowGoals, newGoal.trim()]
      }));
      setNewGoal('');
    }
  };

  const removeTomorrowGoal = (index: number) => {
    setReflection(prev => ({
      ...prev,
      tomorrowGoals: prev.tomorrowGoals.filter((_, i) => i !== index)
    }));
  };

  const completedTasks = todayCard?.tasks?.filter((task: any) => task.completed) || [];
  const totalTasks = todayCard?.tasks?.length || 0;
  const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-400';
    if (rating >= 6) return 'text-yellow-400';
    if (rating >= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getRatingEmoji = (rating: number) => {
    if (rating >= 9) return '🌟';
    if (rating >= 8) return '😊';
    if (rating >= 7) return '🙂';
    if (rating >= 6) return '😐';
    if (rating >= 5) return '😕';
    return '😟';
  };

  return (
    <div className="p-4 space-y-6 bg-gradient-to-br from-black via-gray-900 to-black min-h-full">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <Moon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Nightly Checkout</h1>
            <p className="text-gray-400 text-sm">Reflect and prepare for tomorrow</p>
          </div>
        </div>
        
        {/* Day Summary */}
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-300">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <span>{completedTasks.length}/{totalTasks} tasks completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-blue-400" />
            <span>{Math.round(completionRate)}% completion rate</span>
          </div>
        </div>
      </motion.div>

      {/* Day Rating */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 border-purple-400/30 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">How was your day?</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-6xl mb-2">
                  {getRatingEmoji(reflection.overallRating)}
                </div>
                <div className={`text-2xl font-bold ${getRatingColor(reflection.overallRating)}`}>
                  {reflection.overallRating}/10
                </div>
              </div>
              
              <Slider
                value={[reflection.overallRating]}
                onValueChange={(value) => setReflection(prev => ({ ...prev, overallRating: value[0] }))}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Energy Level</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">1</span>
                    <Slider
                      value={[reflection.energyLevel]}
                      onValueChange={(value) => setReflection(prev => ({ ...prev, energyLevel: value[0] }))}
                      max={10}
                      min={1}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-500">10</span>
                  </div>
                  <div className="text-center text-sm text-gray-300 mt-1">
                    {reflection.energyLevel}/10
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Focus Quality</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">1</span>
                    <Slider
                      value={[reflection.focusQuality]}
                      onValueChange={(value) => setReflection(prev => ({ ...prev, focusQuality: value[0] }))}
                      max={10}
                      min={1}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-500">10</span>
                  </div>
                  <div className="text-center text-sm text-gray-300 mt-1">
                    {reflection.focusQuality}/10
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Accomplishments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 border-green-400/30 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Today's Accomplishments</h3>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/40">
                {reflection.accomplishments.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reflection.accomplishments.map((accomplishment, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-green-500/10 border border-green-400/30 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span className="text-green-200">{accomplishment}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeAccomplishment(index)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  >
                    ✕
                  </Button>
                </motion.div>
              ))}
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add an accomplishment..."
                  value={newAccomplishment}
                  onChange={(e) => setNewAccomplishment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addAccomplishment()}
                  className="flex-1 px-3 py-2 bg-gray-800/60 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 text-sm"
                />
                <Button
                  size="sm"
                  onClick={addAccomplishment}
                  className="bg-green-500/20 border border-green-400/50 text-green-300 hover:bg-green-500/30"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Challenges & Learnings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 gap-4"
      >
        <Card className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 border-orange-400/30 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-orange-400" />
              <h3 className="text-lg font-semibold text-white">Challenges</h3>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="What challenges did you face today? How did you handle them?"
              value={reflection.challenges}
              onChange={(e) => setReflection(prev => ({ ...prev, challenges: e.target.value }))}
              className="bg-gray-800/60 border-gray-600/50 text-white placeholder-gray-500 resize-none"
              rows={3}
            />
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 border-blue-400/30 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Learnings</h3>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="What did you learn today? Any insights or realizations?"
              value={reflection.learnings}
              onChange={(e) => setReflection(prev => ({ ...prev, learnings: e.target.value }))}
              className="bg-gray-800/60 border-gray-600/50 text-white placeholder-gray-500 resize-none"
              rows={3}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Gratitude */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 border-pink-400/30 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-pink-400" />
              <h3 className="text-lg font-semibold text-white">Gratitude</h3>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="What are you grateful for today? Acknowledge the positives..."
              value={reflection.gratitude}
              onChange={(e) => setReflection(prev => ({ ...prev, gratitude: e.target.value }))}
              className="bg-gray-800/60 border-gray-600/50 text-white placeholder-gray-500 resize-none"
              rows={3}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Tomorrow's Goals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 border-yellow-400/30 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Tomorrow's Goals</h3>
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/40">
                {reflection.tomorrowGoals.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reflection.tomorrowGoals.map((goal, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-400/30 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-yellow-400" />
                    <span className="text-yellow-200">{goal}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeTomorrowGoal(index)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  >
                    ✕
                  </Button>
                </motion.div>
              ))}
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add a goal for tomorrow..."
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTomorrowGoal()}
                  className="flex-1 px-3 py-2 bg-gray-800/60 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 text-sm"
                />
                <Button
                  size="sm"
                  onClick={addTomorrowGoal}
                  className="bg-yellow-500/20 border border-yellow-400/50 text-yellow-300 hover:bg-yellow-500/30"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col gap-3 pt-4"
      >
        <Button 
          onClick={onOrganizeTasks}
          disabled={isAnalyzingTasks}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl shadow-lg"
        >
          {isAnalyzingTasks ? (
            <>
              <motion.div 
                className="h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full" 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Preparing Tomorrow...
            </>
          ) : (
            <>
              <Target className="h-5 w-5 mr-2" />
              Organize Tomorrow's Tasks
            </>
          )}
        </Button>
        
        <Button 
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg"
        >
          <Save className="h-5 w-5 mr-2" />
          Save Daily Reflection
        </Button>
      </motion.div>
    </div>
  );
};