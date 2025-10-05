import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layout, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PlanBuilderCard() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
    >
      <Card 
        className="border border-gray-800 bg-black/40 hover:border-siso-orange/40 transition-all duration-300 shadow-lg"
      >
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="h-20 w-20 rounded-full bg-gradient-to-br from-siso-red/30 to-siso-orange/30 flex items-center justify-center mb-6 ring-4 ring-siso-orange/20 shadow-md"
            >
              <Layout className="h-10 w-10 text-white" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-3">Create a New Plan</h3>
            <p className="text-gray-300 text-lg mb-6 max-w-xl mx-auto">
              Build detailed project plans and cost estimates for your clients
            </p>
            <Button 
              className="w-full max-w-md bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90 text-lg py-6 text-white font-medium shadow-md"
              onClick={() => navigate('/onboarding-chat')}
            >
              Start Building
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
