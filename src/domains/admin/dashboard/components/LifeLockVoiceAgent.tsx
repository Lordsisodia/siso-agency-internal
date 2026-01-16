import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX, HelpCircle } from 'lucide-react';
import { voiceService } from '@/services/voice';
import { motion, AnimatePresence } from 'framer-motion';
import { MicrophonePermissionGuide } from './MicrophonePermissionGuide';

interface LifeLockVoiceAgentProps {
  onVoiceCommand?: (command: string) => void;
  className?: string;
}

export const LifeLockVoiceAgent: React.FC<LifeLockVoiceAgentProps> = ({
  onVoiceCommand,
  className = ''
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);

  console.log('🤖 [LIFELOCK VOICE] LifeLockVoiceAgent component initialized');
  
  // Check voice support on component mount
  useEffect(() => {
    const checkSupport = () => {
      const supported = voiceService.isSpeechRecognitionSupported();
      setIsSupported(supported);
      
      const diag = {
        speechRecognition: !!window.SpeechRecognition || !!window.webkitSpeechRecognition,
        mediaDevices: !!navigator.mediaDevices,
        getUserMedia: !!navigator.mediaDevices?.getUserMedia,
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        userAgent: navigator.userAgent,
        browser: getBrowserInfo()
      };
      setDiagnostics(diag);
      
      console.log('🔍 [LIFELOCK VOICE] Support check:', { supported, diagnostics: diag });
    };
    
    checkSupport();
  }, []);
  
  const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  const handleVoiceToggle = async () => {
    if (isListening) {
      console.log('🛑 [LIFELOCK VOICE] Stopping voice listening...');
      voiceService.stopListening();
      setIsListening(false);
      setTranscript('');
    } else {
      console.log('🎤 [LIFELOCK VOICE] Starting voice listening...');
      setError(null);
      
      try {
        await voiceService.startListening(
          (transcript, isFinal) => {
            console.log('📝 [LIFELOCK VOICE] Transcript update:', { transcript, isFinal });
            setTranscript(transcript);
            
            if (isFinal && transcript.trim()) {
              console.log('✅ [LIFELOCK VOICE] Final transcript received:', transcript);
              handleVoiceCommand(transcript);
              setTranscript('');
              setIsListening(false);
            }
          },
          (errorMsg) => {
            console.error('❌ [LIFELOCK VOICE] Voice error:', errorMsg);
            setError(errorMsg);
            setIsListening(false);
            setTranscript('');
          },
          {
            language: 'en-US',
            continuous: false,
            interimResults: true
          }
        );
        
        setIsListening(true);
        console.log('🎯 [LIFELOCK VOICE] Voice listening started successfully');
        
      } catch (error) {
        console.error('❌ [LIFELOCK VOICE] Failed to start voice listening:', error);
        setError(error instanceof Error ? error.message : 'Voice recognition failed');
      }
    }
  };

  const handleVoiceCommand = async (command: string) => {
    console.log('🧠 [LIFELOCK VOICE] Processing voice command:', command);
    console.log('🔍 [LIFELOCK VOICE] Command analysis:', {
      length: command.length,
      wordCount: command.split(' ').length,
      isTaskCommand: command.toLowerCase().includes('task') || command.toLowerCase().includes('add'),
      isStatusQuery: command.toLowerCase().includes('status') || command.toLowerCase().includes('show'),
      isNavigationCommand: command.toLowerCase().includes('go to') || command.toLowerCase().includes('open'),
      containsKeywords: {
        morning: command.toLowerCase().includes('morning'),
        workout: command.toLowerCase().includes('workout'),
        health: command.toLowerCase().includes('health'),
        meal: command.toLowerCase().includes('meal') || command.toLowerCase().includes('food')
      }
    });

    // Process the command and provide voice feedback
    let response = '';
    
    if (command.toLowerCase().includes('morning')) {
      response = 'I can help you with your morning routine. Would you like to check off items or add new ones?';
    } else if (command.toLowerCase().includes('workout')) {
      response = 'Let me help you track your workout progress. What exercise would you like to log?';
    } else if (command.toLowerCase().includes('task')) {
      response = 'I can help you manage your tasks. What would you like to add or update?';
    } else if (command.toLowerCase().includes('status')) {
      response = 'Here\'s your current status. You have several items to complete today.';
    } else {
      response = `I heard you say "${command}". How can I help you with that?`;
    }

    console.log('💬 [LIFELOCK VOICE] Generated response:', response);

    // REMOVED: Automatic voice response per user preference  
    console.log('🔇 [LIFELOCK VOICE] Auto-voice response DISABLED - Voice input only mode');
    console.log('💬 [LIFELOCK VOICE] Response generated for visual display only');
    
    /* REMOVED AUTO-TTS RESPONSE
    // Speak the response
    if (voiceService.isTTSSupported()) {
      console.log('🔊 [LIFELOCK VOICE] Speaking response...');
      setIsSpeaking(true);
      
      try {
        await voiceService.speak(
          response,
          { voice: 'Fritz-PlayAI' },
          () => {
            console.log('▶️ [LIFELOCK VOICE] Started speaking response');
          },
          () => {
            console.log('🏁 [LIFELOCK VOICE] Finished speaking response');
            setIsSpeaking(false);
          },
          (error) => {
            console.error('❌ [LIFELOCK VOICE] TTS error:', error);
            setIsSpeaking(false);
          }
        );
      } catch (error) {
        console.error('❌ [LIFELOCK VOICE] Failed to speak response:', error);
        setIsSpeaking(false);
      }
    }
    */

    // Call the parent callback
    if (onVoiceCommand) {
      console.log('📞 [LIFELOCK VOICE] Calling parent callback with command');
      onVoiceCommand(command);
    }
  };

  const clearError = () => {
    console.log('🧹 [LIFELOCK VOICE] Clearing error');
    setError(null);
  };

  const requestMicrophonePermission = async () => {
    console.log('🎤 [LIFELOCK VOICE] Requesting microphone permission...');
    setError(null);
    
    try {
      // Try the retry method from voice service first
      const retrySuccess = await voiceService.retryMicrophoneAccess();
      
      if (retrySuccess) {
        console.log('✅ [LIFELOCK VOICE] Microphone permission granted via retry!');
        setIsSupported(true);
        setError('✅ Microphone access granted! You can now use voice commands.');
        return;
      }
      
      // Fallback to direct getUserMedia
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ [LIFELOCK VOICE] Microphone permission granted via direct access!');
      
      // Clean up the stream
      stream.getTracks().forEach(track => track.stop());
      
      // Update support status
      setIsSupported(true);
      setError('✅ Microphone access granted! You can now use voice commands.');
      
    } catch (error: any) {
      console.error('❌ [LIFELOCK VOICE] All permission requests failed:', error);
      
      let errorMsg = '🚫 Microphone access failed. ';
      if (error.name === 'NotAllowedError') {
        errorMsg += 'Click the 🎤 icon in your browser address bar → "Allow" → Refresh page.';
      } else if (error.name === 'NotFoundError') {
        errorMsg += 'No microphone detected. Check your microphone connection.';
      } else if (error.name === 'NotSupportedError') {
        errorMsg += 'Browser not supported. Try Chrome, Edge, or Safari.';
      } else {
        errorMsg += `Error: ${error.message}. Try refreshing the page.`;
      }
      
      setError(errorMsg);
    }
  };

  const testVoiceFeatures = async () => {
    console.log('🧪 [LIFELOCK VOICE] Testing voice features...');
    setError(null);
    
    // Test 1: Check microphone permissions
    try {
      const hasPermission = await voiceService.checkMicrophonePermissions();
      console.log('🧪 [LIFELOCK VOICE] Microphone test:', hasPermission ? 'PASS' : 'FAIL');
      
      if (!hasPermission) {
        setError('Microphone permission test failed. Please allow microphone access.');
        return;
      }
    } catch (error) {
      console.error('❌ [LIFELOCK VOICE] Microphone test error:', error);
      setError('Microphone test failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      return;
    }
    
    // Test 2: Try starting recognition briefly
    try {
      console.log('🧪 [LIFELOCK VOICE] Testing speech recognition start...');
      await voiceService.startListening(
        (transcript, isFinal) => {
          console.log('🧪 [LIFELOCK VOICE] Test transcript:', { transcript, isFinal });
        },
        (error) => {
          console.error('🧪 [LIFELOCK VOICE] Test recognition error:', error);
          setError('Recognition test failed: ' + error);
        }
      );
      
      // Stop after 2 seconds
      setTimeout(() => {
        voiceService.stopListening();
        console.log('✅ [LIFELOCK VOICE] Voice test completed successfully');
        setError(null);
      }, 2000);
      
    } catch (error) {
      console.error('❌ [LIFELOCK VOICE] Recognition test error:', error);
      setError('Recognition test failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      {/* Voice Agent Button */}
      <Button
        onClick={handleVoiceToggle}
        className={`relative w-16 h-16 rounded-full shadow-lg transition-all duration-300 ${
          isListening 
            ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
        disabled={isSpeaking}
      >
        <AnimatePresence mode="sync">
          <motion.div
            key={isListening ? 'listening' : 'idle'}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            {isListening ? (
              <MicOff className="h-6 w-6 text-white" />
            ) : (
              <Mic className="h-6 w-6 text-white" />
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Speaking indicator */}
        {isSpeaking && (
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <Volume2 className="h-3 w-3 text-white m-0.5" />
          </motion.div>
        )}
      </Button>

      {/* Status Text */}
      <div className="text-center min-h-[2rem]">
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm font-medium"
          >
            🎤 Listening...
          </motion.div>
        )}
        
        {isSpeaking && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-green-400 text-sm font-medium"
          >
            🔊 Speaking...
          </motion.div>
        )}
        
        {!isListening && !isSpeaking && (
          <div className="text-gray-400 text-sm">
            Voice Agent Ready
          </div>
        )}
      </div>

      {/* Live Transcript */}
      {transcript && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/50 border border-gray-600 rounded-lg p-3 max-w-xs"
        >
          <div className="text-yellow-300 text-xs font-medium mb-1">Listening:</div>
          <div className="text-white text-sm">{transcript}</div>
        </motion.div>
      )}

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 max-w-xs"
        >
          <div className="flex items-center justify-between">
            <div className="text-red-400 text-sm">⚠️ {error}</div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-300 ml-2"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}

      {/* Support Status */}
      {!isSupported && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 max-w-xs"
        >
          <div className="text-yellow-400 text-xs font-medium mb-2">
            ⚠️ Voice recognition not supported
          </div>
          {diagnostics && (
            <div className="space-y-1 text-xs text-gray-400">
              <div>Browser: {diagnostics.browser}</div>
              <div>Protocol: {diagnostics.protocol}</div>
              <div>Speech API: {diagnostics.speechRecognition ? '✅' : '❌'}</div>
              <div>Media API: {diagnostics.mediaDevices ? '✅' : '❌'}</div>
              <div className="text-yellow-300 mt-2">
                Try Chrome, Edge, or Safari with HTTPS
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Permission Request Button */}
      {!isSupported && (
        <div className="flex flex-col space-y-2">
          <Button
            onClick={requestMicrophonePermission}
            size="sm"
            className="text-xs bg-orange-600 hover:bg-orange-700 text-white"
          >
            🎤 Enable Microphone
          </Button>
          <Button
            onClick={async () => {
              setError(null);
              console.log('🔧 [LIFELOCK VOICE] Forcing Chrome microphone bypass...');
              try {
                const success = await voiceService.forceChromeMicrophoneAccess();
                if (success) {
                  setIsSupported(true);
                  setError('✅ Chrome bypass successful! Microphone unlocked.');
                } else {
                  setError('❌ Chrome bypass failed. Try manual reset steps.');
                }
              } catch (error) {
                setError('❌ Chrome bypass error: ' + (error instanceof Error ? error.message : 'Unknown error'));
              }
            }}
            size="sm"
            className="text-xs bg-red-600 hover:bg-red-700 text-white"
          >
            🔓 Force Chrome Unlock
          </Button>
          <Button
            onClick={testVoiceFeatures}
            size="sm"
            variant="outline"
            className="text-xs bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            🧪 Test Voice Features
          </Button>
          <Button
            onClick={() => setShowPermissionGuide(true)}
            size="sm"
            variant="outline"
            className="text-xs bg-blue-800 border-blue-600 text-blue-300 hover:bg-blue-700"
          >
            <HelpCircle className="h-3 w-3 mr-1" />
            Help
          </Button>
        </div>
      )}

      {/* Help Text */}
      <div className="text-gray-500 text-xs text-center max-w-xs">
        {isSupported ? (
          <>Try: "Add morning task", "Show workout status", "Help with meals"</>
        ) : (
          <>Voice recognition requires Chrome, Edge, or Safari with microphone permissions</>
        )}
      </div>

      {/* Permission Guide Modal */}
      <AnimatePresence>
        {showPermissionGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPermissionGuide(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <MicrophonePermissionGuide 
                onClose={() => setShowPermissionGuide(false)} 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 