import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Target } from 'lucide-react';
import { Button } from '@/shared/ui/button';

interface QuickActionsSectionProps {
  handleQuickAdd: () => void;
  handleOrganizeTasks: () => void;
  isAnalyzingTasks: boolean;
  todayCard: any;
}

export const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({
  handleQuickAdd,
  handleOrganizeTasks,
  isAnalyzingTasks,
  todayCard
}) => {
  return (
    <section className="flex justify-center pt-6 sm:pt-8">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <Button 
          className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-8 sm:px-10 py-4 sm:py-5 text-sm sm:text-base font-semibold rounded-2xl shadow-lg hover:shadow-orange-500/30 transition-all duration-300 transform hover:scale-105"
          onClick={handleQuickAdd}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          <Plus className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
          Add New Task
        </Button>
        
        <Button 
          className="relative overflow-hidden bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 sm:px-10 py-4 sm:py-5 text-sm sm:text-base font-semibold rounded-2xl shadow-lg hover:shadow-purple-500/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleOrganizeTasks}
          disabled={isAnalyzingTasks || !todayCard || todayCard.tasks.length === 0}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          {isAnalyzingTasks ? (
            <>
              <motion.div 
                className="h-5 w-5 sm:h-6 sm:w-6 mr-2 border-2 border-white border-t-transparent rounded-full" 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Analyzing...
            </>
          ) : (
            <>
              <Target className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              Organize Tasks
            </>
          )}
        </Button>
      </div>
    </section>
  );
};