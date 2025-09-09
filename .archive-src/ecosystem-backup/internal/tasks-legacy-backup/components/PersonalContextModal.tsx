import React, { useState, useEffect } from 'react';
import { X, User, Target, Zap, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

interface PersonalContext {
  currentGoals: string;
  skillPriorities: string;
  revenueTargets: string;
  timeConstraints: string;
  currentProjects: string;
  hatedTasks: string;
  valuedTasks: string;
  learningObjectives: string;
}

interface PersonalContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (context: PersonalContext) => void;
}

const defaultContext: PersonalContext = {
  currentGoals: "Building and scaling SISO-INTERNAL task management system",
  skillPriorities: "AI integration, full-stack development, system optimization",
  revenueTargets: "Growing business through efficient product development",
  timeConstraints: "High efficiency focus, minimal time waste",
  currentProjects: "SISO-INTERNAL, Claude Code integration, AI-powered features",
  hatedTasks: "Meetings, emails, repetitive admin work",
  valuedTasks: "Feature development, system architecture, AI implementation",
  learningObjectives: "Advanced AI integration, performance optimization, user experience"
};

export const PersonalContextModal: React.FC<PersonalContextModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [context, setContext] = useState<PersonalContext>(defaultContext);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ai-xp-personal-context');
    if (saved) {
      try {
        setContext(JSON.parse(saved));
      } catch (error) {
        console.warn('Failed to load personal context, using defaults');
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('ai-xp-personal-context', JSON.stringify(context));
    onSave(context);
    onClose();
  };

  const updateField = (field: keyof PersonalContext, value: string) => {
    setContext(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <User className="h-6 w-6 text-blue-400" />
            <div>
              <CardTitle className="text-xl text-white">Personal Context for AI XP Analysis</CardTitle>
              <p className="text-gray-400 text-sm mt-1">
                Help the AI understand what's actually valuable to YOU and YOUR goals
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Current Goals */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-blue-300">
                <Target className="h-4 w-4" />
                Current Goals & Objectives
              </label>
              <textarea
                value={context.currentGoals}
                onChange={(e) => updateField('currentGoals', e.target.value)}
                placeholder="What are you trying to achieve right now?"
                className="w-full h-20 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>

            {/* Skill Priorities */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-green-300">
                <Zap className="h-4 w-4" />
                Skill Development Priorities
              </label>
              <textarea
                value={context.skillPriorities}
                onChange={(e) => updateField('skillPriorities', e.target.value)}
                placeholder="What skills are you focusing on developing?"
                className="w-full h-20 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm focus:border-green-500 focus:outline-none resize-none"
              />
            </div>

            {/* Revenue Targets */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-yellow-300">
                Revenue & Business Targets
              </label>
              <textarea
                value={context.revenueTargets}
                onChange={(e) => updateField('revenueTargets', e.target.value)}
                placeholder="What are your revenue goals and business priorities?"
                className="w-full h-20 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm focus:border-yellow-500 focus:outline-none resize-none"
              />
            </div>

            {/* Time Constraints */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-red-300">
                Time Constraints & Efficiency Goals
              </label>
              <textarea
                value={context.timeConstraints}
                onChange={(e) => updateField('timeConstraints', e.target.value)}
                placeholder="How do you want to optimize your time?"
                className="w-full h-20 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm focus:border-red-500 focus:outline-none resize-none"
              />
            </div>

            {/* Current Projects */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-300">
                Current Projects & Focus Areas
              </label>
              <textarea
                value={context.currentProjects}
                onChange={(e) => updateField('currentProjects', e.target.value)}
                placeholder="What projects are you actively working on?"
                className="w-full h-20 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm focus:border-purple-500 focus:outline-none resize-none"
              />
            </div>

            {/* Learning Objectives */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyan-300">
                Learning Objectives
              </label>
              <textarea
                value={context.learningObjectives}
                onChange={(e) => updateField('learningObjectives', e.target.value)}
                placeholder="What do you want to learn or get better at?"
                className="w-full h-20 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm focus:border-cyan-500 focus:outline-none resize-none"
              />
            </div>
            
          </div>

          {/* Full width fields */}
          <div className="space-y-4">
            
            {/* Valued Tasks */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-green-300">
                💰 High-Value Tasks (AI will give these MORE XP)
              </label>
              <textarea
                value={context.valuedTasks}
                onChange={(e) => updateField('valuedTasks', e.target.value)}
                placeholder="What types of tasks create the most value for you? (e.g., feature development, automation, user research)"
                className="w-full h-16 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm focus:border-green-500 focus:outline-none resize-none"
              />
            </div>

            {/* Hated Tasks */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-red-300">
                💩 Time-Wasting Tasks (AI will give these LESS XP)
              </label>
              <textarea
                value={context.hatedTasks}
                onChange={(e) => updateField('hatedTasks', e.target.value)}
                placeholder="What tasks do you hate or consider time waste? (e.g., excessive meetings, repetitive admin work)"
                className="w-full h-16 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm focus:border-red-500 focus:outline-none resize-none"
              />
            </div>
            
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
            >
              <Save className="h-4 w-4" />
              Save Context
            </button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};