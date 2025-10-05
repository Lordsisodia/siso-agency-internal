
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Heart, 
  CheckCircle, 
  ExternalLink, 
  Users, 
  MessageSquare, 
  Calendar, 
  DollarSign, 
  Clock, 
  ArrowRight,
  BarChart,
  Lightbulb,
  Image
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

export interface PainPointDetailProps {
  problem: string;
  statistic: string;
  solution: string;
  detailedSolution: string;
  benefits: string[];
  metrics: { label: string; value: string; icon: JSX.Element }[];
  images: { url: string; caption: string }[];
  caseStudyLink: string;
}

interface PainPointModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  painPoint: PainPointDetailProps | null;
}

export const PainPointsModal = ({ open, onOpenChange, painPoint }: PainPointModalProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  
  if (!painPoint) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black/90 border-siso-orange/20 text-white p-0">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-siso-red/20 to-siso-orange/20 px-6 py-5 rounded-t-lg border-b border-siso-orange/20">
          <DialogHeader className="mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-siso-orange/10">
                <Lightbulb className="h-5 w-5 text-siso-orange" />
              </div>
              <DialogTitle className="text-xl font-bold text-white">
                {painPoint.problem}
              </DialogTitle>
            </div>
          </DialogHeader>
          
          <div className="bg-siso-orange/10 text-siso-orange text-xs font-medium px-3 py-1.5 rounded inline-flex gap-1.5 items-center">
            <BarChart className="h-3.5 w-3.5" />
            <span>{painPoint.statistic}</span>
          </div>
        </div>
        
        {/* Body with tabs */}
        <div className="px-6 py-5">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-black/30 border border-siso-text/10 p-1 mb-5 w-full grid grid-cols-3">
              <TabsTrigger value="overview" className="data-[state=active]:bg-siso-orange/20 data-[state=active]:text-siso-orange">
                Overview
              </TabsTrigger>
              <TabsTrigger value="solution" className="data-[state=active]:bg-siso-orange/20 data-[state=active]:text-siso-orange">
                Solution
              </TabsTrigger>
              <TabsTrigger value="visuals" className="data-[state=active]:bg-siso-orange/20 data-[state=active]:text-siso-orange">
                Visuals
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-0 animate-in fade-in-50 duration-300">
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-siso-orange" />
                    The Challenge
                  </h3>
                  <p className="text-siso-text">{painPoint.solution}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                  <div>
                    <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Heart className="h-4 w-4 text-siso-orange" />
                      Key Benefits
                    </h4>
                    <div className="space-y-2.5">
                      {painPoint.benefits.map((benefit, index) => (
                        <motion.div 
                          key={index} 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-2 bg-black/20 p-3 rounded-lg border border-siso-text/5"
                        >
                          <CheckCircle className="h-4 w-4 text-siso-orange shrink-0 mt-0.5" />
                          <span className="text-sm text-siso-text">{benefit}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-siso-orange" />
                      Impact Metrics
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {painPoint.metrics.map((metric, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-black/30 rounded-lg p-3 border border-siso-text/10"
                        >
                          <div className="flex items-center gap-1.5 text-xs text-siso-text mb-1">
                            {metric.icon}
                            <span>{metric.label}</span>
                          </div>
                          <div className="text-lg font-bold text-siso-orange">{metric.value}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="solution" className="mt-0 animate-in fade-in-50 duration-300">
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-siso-orange" />
                    Detailed Solution
                  </h3>
                  <div className="bg-black/20 rounded-lg border border-siso-text/10 p-4">
                    <p className="text-siso-text">{painPoint.detailedSolution}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-siso-orange" />
                    Performance Indicators
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="bg-black/30 p-3 rounded-lg border border-siso-text/10">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-siso-orange" />
                          <span className="text-white text-sm">Client Retention</span>
                        </div>
                        <span className="text-siso-orange text-sm font-medium">+60%</span>
                      </div>
                      <Progress value={60} className="h-2 bg-black/50" indicatorClassName="bg-gradient-to-r from-siso-red to-siso-orange" />
                    </div>
                    
                    <div className="bg-black/30 p-3 rounded-lg border border-siso-text/10">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-siso-orange" />
                          <span className="text-white text-sm">Revenue Growth</span>
                        </div>
                        <span className="text-siso-orange text-sm font-medium">+40%</span>
                      </div>
                      <Progress value={40} className="h-2 bg-black/50" indicatorClassName="bg-gradient-to-r from-siso-red to-siso-orange" />
                    </div>
                    
                    <div className="bg-black/30 p-3 rounded-lg border border-siso-text/10">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-siso-orange" />
                          <span className="text-white text-sm">Time Saved</span>
                        </div>
                        <span className="text-siso-orange text-sm font-medium">+75%</span>
                      </div>
                      <Progress value={75} className="h-2 bg-black/50" indicatorClassName="bg-gradient-to-r from-siso-red to-siso-orange" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="visuals" className="mt-0 animate-in fade-in-50 duration-300">
              {painPoint.images.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Image className="h-5 w-5 text-siso-orange" />
                    Visual Solution
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {painPoint.images.map((image, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.03 }}
                        className="group relative overflow-hidden rounded-lg border border-siso-text/10 bg-black/20"
                      >
                        <img 
                          src={image.url} 
                          alt={image.caption} 
                          className="w-full h-auto"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                          <p className="text-sm text-white group-hover:text-siso-orange transition-colors">{image.caption}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Image className="h-16 w-16 text-siso-text/20 mb-3" />
                  <h3 className="text-white text-lg font-medium mb-1">No visual examples available</h3>
                  <p className="text-siso-text text-sm">Contact us to see a live demo of this solution</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter className="px-6 py-4 border-t border-siso-text/10 flex flex-col sm:flex-row sm:justify-between gap-4">
          <Button
            variant="outline"
            className="border-siso-orange/30 text-siso-orange hover:bg-siso-orange/10"
            onClick={() => window.open(painPoint.caseStudyLink, '_blank')}
          >
            View Full Case Study
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
          
          <Button 
            className="bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90 text-white"
            onClick={() => onOpenChange(false)}
          >
            Got It
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
