
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GradientHeading } from '@/components/ui/gradient-heading';

const ThankYou = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-siso-bg to-black p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        <div className="bg-black/40 backdrop-blur-md rounded-lg border border-siso-text/10 shadow-xl p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mx-auto bg-gradient-to-r from-siso-red to-siso-orange w-16 h-16 rounded-full flex items-center justify-center mb-6"
          >
            <CheckCircle className="h-8 w-8 text-white" />
          </motion.div>
          
          <GradientHeading className="text-3xl mb-4">
            Thank You!
          </GradientHeading>
          
          <p className="text-siso-text mb-8">
            Your app development journey has begun. Our team will be in touch shortly to discuss the next steps.
          </p>
          
          <div className="space-y-3">
            <Button 
              asChild
              className="w-full bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90"
            >
              <Link to="/home">
                Go to Dashboard
              </Link>
            </Button>
            
            <p className="text-xs text-siso-text/60">
              Have questions? Contact us at <a href="mailto:support@siso.com" className="text-siso-orange hover:underline">support@siso.com</a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ThankYou;
