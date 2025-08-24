import React, { useState, useEffect } from 'react';
import { 
  Coffee
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Plan from '@/components/ui/agent-plan';
import { format } from 'date-fns';

// Simplified interface for light work section using AI Agent Plan

interface LightFocusWorkSectionProps {
  selectedDate: Date;
}

export const LightFocusWorkSection: React.FC<LightFocusWorkSectionProps> = ({
  selectedDate
}) => {

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
            
            {/* Task Management Interface */}
            <div className="h-[600px] overflow-auto">
              <Plan />
            </div>
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
};