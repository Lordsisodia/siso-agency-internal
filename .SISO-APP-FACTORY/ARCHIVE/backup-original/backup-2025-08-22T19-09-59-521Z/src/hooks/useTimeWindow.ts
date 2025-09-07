
import { useState, useEffect, useRef } from 'react';

export const useTimeWindow = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const timelineRef = useRef<HTMLDivElement>(null);

  const getCurrentWindow = () => {
    const currentHour = currentTime.getHours();
    // Show full day instead of just 8 hours
    return { windowStart: 0, windowEnd: 24 };
  };

  const scrollToCurrentTime = () => {
    if (timelineRef.current) {
      const currentHour = currentTime.getHours();
      const currentMinute = currentTime.getMinutes();
      const totalMinutes = currentHour * 60 + currentMinute;
      const scrollPosition = (totalMinutes / (24 * 60)) * timelineRef.current.scrollHeight;
      
      const containerHeight = timelineRef.current.clientHeight;
      const targetPosition = scrollPosition - (containerHeight / 2);
      
      timelineRef.current.scrollTo({
        top: Math.max(0, targetPosition),
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    // Initial scroll to current time with a slight delay to ensure DOM is ready
    const timer = setTimeout(scrollToCurrentTime, 100);

    const timeUpdateInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => {
      clearTimeout(timer);
      clearInterval(timeUpdateInterval);
    };
  }, []);

  return { currentTime, timelineRef, getCurrentWindow, scrollToCurrentTime };
};
