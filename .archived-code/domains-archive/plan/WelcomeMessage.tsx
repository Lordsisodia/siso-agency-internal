
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, TrendingUp, Trophy, CheckCircle2, Clock, Info, ArrowRight, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface CaseStudyDetails {
  title: string;
  description: string;
  metrics: { label: string; value: string; icon: React.ReactNode }[];
  imageUrl: string;
}

interface WelcomeMessageProps {
  agencyName: string;
  industryType: string;
  scrollToFeatures: () => void;
}

export const WelcomeMessage = ({ 
  agencyName, 
  industryType,
  scrollToFeatures 
}: WelcomeMessageProps) => {
  const [showCaseStudy, setShowCaseStudy] = useState(false);
  const [caseStudyType, setCaseStudyType] = useState<'revenue' | 'retention'>('revenue');
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  const highlightText = "text-siso-orange font-semibold";
  
  const caseStudies: Record<'revenue' | 'retention', CaseStudyDetails> = {
    revenue: {
      title: "How Agency X Increased Revenue by 40%",
      description: "Agency X was struggling with scaling their operations and maximizing revenue from their OnlyFans creator clients. By implementing our customized management platform, they were able to streamline workflows, reduce manual tasks, and focus on high-value activities that directly contributed to revenue growth.",
      metrics: [
        { label: "Revenue Growth", value: "40%", icon: <TrendingUp className="h-4 w-4 text-siso-orange" /> },
        { label: "Time Saved Weekly", value: "25+ hours", icon: <Clock className="h-4 w-4 text-siso-orange" /> },
        { label: "Client Capacity", value: "Doubled", icon: <Users className="h-4 w-4 text-siso-orange" /> },
        { label: "Content Production", value: "+60%", icon: <Calendar className="h-4 w-4 text-siso-orange" /> }
      ],
      imageUrl: "/lovable-uploads/c7ac43fd-bc3e-478d-8b4f-809beafb6838.png"
    },
    retention: {
      title: "How Agency Y Improved Client Retention by 60%",
      description: "Agency Y was facing high creator churn rates, with many clients leaving after just 2-3 months. By implementing our transparent reporting system and creator-focused dashboard, they created a more collaborative relationship with their clients, demonstrating clear value and improving satisfaction.",
      metrics: [
        { label: "Retention Rate", value: "+60%", icon: <Heart className="h-4 w-4 text-siso-orange" /> },
        { label: "Client Satisfaction", value: "92%", icon: <Trophy className="h-4 w-4 text-siso-orange" /> },
        { label: "Avg. Client Lifespan", value: "18 months", icon: <Users className="h-4 w-4 text-siso-orange" /> },
        { label: "Referral Rate", value: "+75%", icon: <TrendingUp className="h-4 w-4 text-siso-orange" /> }
      ],
      imageUrl: "/lovable-uploads/1f9eba1e-c2af-4ed8-84e7-a375872c9182.png"
    }
  };
  
  const handleOpenCaseStudy = (type: 'revenue' | 'retention') => {
    setCaseStudyType(type);
    setShowCaseStudy(true);
  };
  
  return (
    <>
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="bg-gradient-to-r from-siso-red/10 via-siso-orange/15 to-siso-orange/10 rounded-lg border border-siso-orange/20 shadow-lg p-6 mb-8"
      >
        <motion.div variants={item} className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-siso-orange/10 rounded-full">
            <Heart className="h-6 w-6 text-siso-orange" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-siso-orange to-white bg-clip-text text-transparent">
            Welcome, {agencyName}!
          </h2>
        </motion.div>
        
        <motion.div variants={item} className="mb-4 space-y-3">
          <p className="text-white text-lg leading-relaxed">
            We've designed your <span className={highlightText}>custom {industryType} management platform</span> to transform 
            how you run your business. This solution addresses your unique challenges and will 
            help you <span className={highlightText}>scale operations</span> while dramatically improving client retention.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <motion.div 
              variants={item}
              className="flex items-start gap-2 bg-black/20 rounded-lg p-3 border border-siso-text/10 cursor-pointer hover:border-siso-orange/30 transition-all"
              onClick={() => handleOpenCaseStudy('revenue')}
            >
              <TrendingUp className="h-5 w-5 text-siso-orange shrink-0 mt-0.5" />
              <div>
                <h3 className="text-white font-medium flex items-center">
                  40% Increase in Revenue
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 ml-1.5 text-siso-text" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-xs">Click to see how agencies like yours have increased revenue</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </h3>
                <p className="text-siso-text text-sm">Based on similar implementations with agencies like yours</p>
              </div>
            </motion.div>
            
            <motion.div 
              variants={item}
              className="flex items-start gap-2 bg-black/20 rounded-lg p-3 border border-siso-text/10 cursor-pointer hover:border-siso-orange/30 transition-all"
              onClick={() => handleOpenCaseStudy('retention')}
            >
              <Trophy className="h-5 w-5 text-siso-orange shrink-0 mt-0.5" />
              <div>
                <h3 className="text-white font-medium flex items-center">
                  60% Improved Client Retention
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 ml-1.5 text-siso-text" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-xs">Click to see how agencies like yours have improved retention</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </h3>
                <p className="text-siso-text text-sm">Through better communication and organization</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div variants={item} className="space-y-2 mb-4">
          <h3 className="text-white font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-siso-orange" />
            Platform Highlights:
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <li className="flex items-center gap-2 text-siso-text">
              <CheckCircle2 className="h-4 w-4 text-siso-orange shrink-0" />
              <span>Custom-built for {industryType} agencies</span>
            </li>
            <li className="flex items-center gap-2 text-siso-text">
              <CheckCircle2 className="h-4 w-4 text-siso-orange shrink-0" />
              <span>Comprehensive client management</span>
            </li>
            <li className="flex items-center gap-2 text-siso-text">
              <CheckCircle2 className="h-4 w-4 text-siso-orange shrink-0" />
              <span>Advanced content scheduling</span>
            </li>
            <li className="flex items-center gap-2 text-siso-text">
              <CheckCircle2 className="h-4 w-4 text-siso-orange shrink-0" />
              <span>Real-time analytics dashboard</span>
            </li>
          </ul>
        </motion.div>
        
        <motion.div variants={item} className="flex flex-col sm:flex-row items-center gap-3 mt-5">
          <Button 
            onClick={scrollToFeatures}
            className="w-full sm:w-auto bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90 text-white"
          >
            Explore All Features
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-2 text-siso-text">
            <Clock className="h-4 w-4 text-siso-orange" />
            <span>Ready to launch in {industryType === "OnlyFans" ? "21" : "30"} days</span>
          </div>
        </motion.div>
      </motion.div>
      
      <Dialog open={showCaseStudy} onOpenChange={setShowCaseStudy}>
        <DialogContent className="max-w-2xl bg-black/90 border-siso-orange/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              {caseStudies[caseStudyType].title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="rounded-lg overflow-hidden border border-siso-text/10">
              <img 
                src={caseStudies[caseStudyType].imageUrl} 
                alt="Case Study" 
                className="w-full h-auto"
              />
            </div>
            
            <p className="text-siso-text">
              {caseStudies[caseStudyType].description}
            </p>
            
            <div>
              <h4 className="text-white font-medium mb-2">Key Results:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {caseStudies[caseStudyType].metrics.map((metric, index) => (
                  <div key={index} className="bg-black/30 rounded p-3 border border-siso-text/10">
                    <div className="flex items-center gap-2 text-xs text-siso-text mb-1">
                      {metric.icon}
                      <span>{metric.label}</span>
                    </div>
                    <div className="text-xl font-bold text-siso-orange">{metric.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              className="bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90 text-white"
              onClick={() => setShowCaseStudy(false)}
            >
              Back to Your Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

