import React from 'react';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';

import { Button } from '@/shared/ui/button';

interface VoiceReflectionButtonProps {
  isRecording: boolean;
  onToggle: () => void;
}

export const VoiceReflectionButton: React.FC<VoiceReflectionButtonProps> = ({ isRecording, onToggle }) => (
  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
    <Button
      onClick={onToggle}
      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 text-lg font-semibold"
      disabled={isRecording}
    >
      {isRecording ? (
        <>
          <div className="animate-pulse mr-2">🎤</div>
          <span>Listening...</span>
        </>
      ) : (
        <>
          <Mic className="h-5 w-5 mr-2" />
          Voice Reflection (3 min)
        </>
      )}
    </Button>
    <p className="text-xs text-purple-400 text-center mt-2">Talk instead of type - 70% faster! ⚡</p>
  </motion.div>
);
