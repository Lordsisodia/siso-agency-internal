
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Award, Star } from 'lucide-react';

interface AchievementListProps {
  achievements?: Array<{ name: string; icon?: string }>;
}

const AchievementList = ({ achievements = [] }: AchievementListProps) => {
  if (!achievements || achievements.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <h3 className="text-sm text-siso-text/70 mb-2 font-medium">Achievements</h3>
      <div className="flex flex-wrap gap-2">
        {achievements.map((achievement, index) => (
          <Badge 
            key={`${achievement.name}-${index}`}
            variant="outline" 
            className="bg-siso-bg/50 border border-siso-text/10 text-siso-text/90 px-3 py-1"
          >
            {achievement.icon ? (
              <img src={achievement.icon} alt="" className="w-3.5 h-3.5 mr-1.5" />
            ) : (
              <Award className="w-3.5 h-3.5 mr-1.5 text-siso-red" />
            )}
            {achievement.name}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default AchievementList;
