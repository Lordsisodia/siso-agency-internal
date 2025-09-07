
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WelcomeLoader } from '@/components/plan/WelcomeLoader';

const DecoraPlan = () => {
  const navigate = useNavigate();
  const [typedText, setTypedText] = useState('');
  const [typingComplete, setTypingComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const agencyName = "Decora Agency";
  
  // Typewriter effect for the agency name
  useEffect(() => {
    const text = agencyName;
    let i = 0;
    // Speed up the typewriter effect
    const interval = setInterval(() => {
      if (i <= text.length) {
        setTypedText(text.substring(0, i));
        i++;
      } else {
        clearInterval(interval);
        setTypingComplete(true);
      }
    }, 80); // Slightly slower for better readability
    
    return () => clearInterval(interval);
  }, []);
  
  // Progress animation
  useEffect(() => {
    if (typingComplete) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setLoadingComplete(true);
            return 100;
          }
          return prev + 3;
        });
      }, 120);
      
      return () => clearInterval(interval);
    }
  }, [typingComplete]);
  
  // Auto-redirect after loading completes
  useEffect(() => {
    if (loadingComplete) {
      // Auto-redirect after a delay
      const redirectTimer = setTimeout(() => {
        navigate('/plan/decora', { replace: true });
      }, 1000); 
      
      return () => clearTimeout(redirectTimer);
    }
  }, [loadingComplete, navigate]);
  
  // Loading steps
  const loadingSteps = [
    "Analyzing your business needs",
    "Preparing feature recommendations",
    "Generating your custom plan"
  ];
  
  const handleContinue = () => {
    navigate('/plan/decora', { replace: true });
  };
  
  // Show the welcome/loading screen
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-siso-bg to-black flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-xl w-full z-10"
      >
        {!typingComplete ? (
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-8 border border-siso-orange/20">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-5"
            >
              <Sparkles className="h-16 w-16 text-siso-orange mx-auto mb-4" />
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Welcome, <span className="text-siso-orange">{typedText}</span>
              <span className="animate-pulse">|</span>
            </h1>
          </div>
        ) : (
          <WelcomeLoader
            progress={progress}
            complete={loadingComplete}
            steps={loadingSteps}
            onContinue={handleContinue}
          />
        )}
      </motion.div>
    </div>
  );
};

export default DecoraPlan;
