
import { useState, useEffect } from 'react';
import { Coffee, Sunset, Moon, Sun } from 'lucide-react';

type PeriodInfo = {
  period: 'morning' | 'afternoon' | 'evening' | 'night';
  greeting: string;
  icon: React.ElementType;
  gradientClass: string;
};

export const useDayPeriod = (): PeriodInfo => {
  const [periodInfo, setPeriodInfo] = useState<PeriodInfo>({
    period: 'morning',
    greeting: 'Good Morning',
    icon: Coffee,
    gradientClass: 'from-blue-600 to-cyan-500'
  });

  useEffect(() => {
    const updatePeriod = () => {
      const hour = new Date().getHours();
      
      if (hour >= 5 && hour < 12) {
        // Morning: 5AM - 11:59AM
        setPeriodInfo({
          period: 'morning',
          greeting: 'Good Morning',
          icon: Coffee,
          gradientClass: 'from-blue-600 to-cyan-500'
        });
      } else if (hour >= 12 && hour < 17) {
        // Afternoon: 12PM - 4:59PM
        setPeriodInfo({
          period: 'afternoon',
          greeting: 'Good Afternoon',
          icon: Sun,
          gradientClass: 'from-amber-500 to-orange-600'
        });
      } else if (hour >= 17 && hour < 21) {
        // Evening: 5PM - 8:59PM
        setPeriodInfo({
          period: 'evening',
          greeting: 'Good Evening',
          icon: Sunset,
          gradientClass: 'from-purple-600 to-pink-500'
        });
      } else {
        // Night: 9PM - 4:59AM
        setPeriodInfo({
          period: 'night',
          greeting: 'Good Night',
          icon: Moon,
          gradientClass: 'from-indigo-800 to-blue-900'
        });
      }
    };

    updatePeriod(); // Run immediately
    
    // Update the period every hour
    const interval = setInterval(updatePeriod, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return periodInfo;
};
