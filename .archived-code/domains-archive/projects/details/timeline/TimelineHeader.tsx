import React from 'react';
import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';

export function TimelineHeader() {
  return (
    <Card className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-siso-text/20 mb-8 backdrop-blur-sm">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-siso-orange/20 rounded-full">
            <Clock className="h-6 w-6 text-siso-orange" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">UbahCryp Project Timeline</h2>
            <p className="text-lg text-gray-300">Duration: 6 weeks (April 28, 2025 - June 6, 2025)</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
