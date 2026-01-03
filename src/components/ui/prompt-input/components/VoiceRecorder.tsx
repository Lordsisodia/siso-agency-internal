import React from 'react';
import { StopCircle } from 'lucide-react';

interface VoiceRecorderProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: (recordingTime: number) => void;
  visualizerBars?: number;
  transcript?: string;
}

/**
 * VoiceRecorder component with recording timer and transcript display
 * Extracted from ai-prompt-box.tsx for reusability
 */
export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  visualizerBars = 32,
  transcript
}) => {
  const [time, setTime] = React.useState(0);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (isRecording) {
      onStartRecording();
      timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      onStopRecording(time);
      setTime(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, time, onStartRecording, onStopRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-between p-4 bg-[#1F2023] rounded-lg border border-red-500/30">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-red-400 text-sm font-medium">Recording</span>
        </div>
        <span className="text-gray-300 text-sm">{formatTime(time)}</span>
      </div>
      
      {/* Real-time transcript display */}
      {transcript && (
        <div className="flex-1 mx-4 p-2 bg-gray-800/50 rounded text-sm text-gray-200">
          {transcript || 'Listening...'}
        </div>
      )}
      
      {/* Visualizer bars */}
      <div className="flex items-center gap-1 mx-4">
        {Array.from({ length: visualizerBars }).map((_, i) => (
          <div
            key={i}
            className="w-1 bg-red-500 rounded-full animate-pulse"
            style={{
              height: `${Math.random() * 20 + 4}px`,
              animationDelay: `${i * 50}ms`,
              animationDuration: `${800 + Math.random() * 400}ms`
            }}
          />
        ))}
      </div>
      
      <button 
        className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-full transition-all"
        onClick={() => onStopRecording(time)}
      >
        <StopCircle className="w-5 h-5 text-red-400" />
      </button>
    </div>
  );
};