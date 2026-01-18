import React, { useState } from 'react';
import { InteractiveTodayCard } from './InteractiveTodayCard';

// Demo component to showcase mobile-optimized daily progress card
export const MobileDailyProgressDemo: React.FC = () => {
  const [isMobileDemo, setIsMobileDemo] = useState(true);

  // Sample data for demonstration
  const sampleCard = {
    id: '1',
    date: new Date(),
    title: 'Today\'s Progress',
    completed: false,
    tasks: [
      { id: '1', title: 'Wake up at 6:00 AM', completed: true },
      { id: '2', title: 'Drink 16oz of water', completed: true },
      { id: '3', title: 'Meditate for 10 minutes', completed: true },
      { id: '4', title: 'Write in journal', completed: true },
      { id: '5', title: 'Review daily goals', completed: false },
      { id: '6', title: 'Healthy breakfast', completed: false },
      { id: '7', title: 'Deep focus work session', completed: false },
      { id: '8', title: 'Exercise for 30 minutes', completed: false },
      { id: '9', title: 'Team standup meeting', completed: false },
      { id: '10', title: 'Client project work', completed: false },
      { id: '11', title: 'Evening reflection', completed: false },
    ]
  };

  const handleViewDetails = (card: any) => {
    
  };

  const handleTaskToggle = (sectionId: string, taskId: string) => {
    
  };

  const handleQuickAdd = (sectionId: string) => {
    
  };

  const handleVoiceInput = () => {
    
  };

  const handleStartTimer = () => {
    
  };

  const handleQuickPhoto = () => {
    
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Demo Controls */}
        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
          <h2 className="text-white font-semibold mb-3">Daily Progress Card Demo</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileDemo(!isMobileDemo)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isMobileDemo 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {isMobileDemo ? 'Mobile View' : 'Desktop View'}
            </button>
            <span className="text-gray-400 text-sm">
              Tap to toggle view mode
            </span>
          </div>
        </div>

        {/* Enhanced Daily Progress Card */}
        <InteractiveTodayCard
          card={sampleCard}
          onViewDetails={handleViewDetails}
          onTaskToggle={handleTaskToggle}
          onQuickAdd={handleQuickAdd}
          onVoiceInput={handleVoiceInput}
          onStartTimer={handleStartTimer}
          onQuickPhoto={handleQuickPhoto}
          isMobile={isMobileDemo}
          className={isMobileDemo ? 'max-w-sm' : 'max-w-2xl'}
        />

        {/* Feature Highlights */}
        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
          <h3 className="text-white font-semibold mb-3">✨ Enhanced Features</h3>
          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              <span>Mobile-first responsive design</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              <span>Swipe navigation between sections</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Auto-collapse completed sections</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Touch-optimized button sizes (44px+)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>Enhanced progress animations</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
              <span>Real-time LifeLock data integration</span>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
          <h3 className="text-white font-semibold mb-3">📱 Mobile Usage</h3>
          <div className="space-y-2 text-sm text-gray-300">
            <p><strong>Swipe:</strong> Left/right to navigate between progress sections</p>
            <p><strong>Tap:</strong> Section headers to expand/collapse task details</p>
            <p><strong>Toggle:</strong> Eye icon to switch between compact and full view</p>
            <p><strong>Navigate:</strong> Arrow buttons or dots to jump to specific sections</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileDailyProgressDemo;