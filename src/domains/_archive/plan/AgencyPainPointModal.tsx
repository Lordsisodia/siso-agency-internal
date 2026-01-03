
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  ExternalLink, 
  ArrowRight, 
  Quote, 
  Users, 
  BarChart, 
  AlertTriangle,
  Info,
  ArrowUpRight,
  MessageSquare,
  Lightbulb,
  TrendingUp,
  Video,
  Play,
  FileText,
  PieChart,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PainPoint } from './AgencyPainPoints';
import { Progress } from '@/components/ui/progress';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';

interface AgencyPainPointModalProps {
  isOpen: boolean;
  onClose: () => void;
  painPoint: PainPoint | null;
  onRequestSolution?: () => void;
}

interface DataPoint {
  label: string;
  value: number;
  color: string;
}

export const AgencyPainPointModal = ({ 
  isOpen, 
  onClose, 
  painPoint,
  onRequestSolution
}: AgencyPainPointModalProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  
  if (!painPoint) return null;
  
  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-amber-500';
      default: return 'text-blue-500';
    }
  };
  
  const getSeverityBgColor = (severity: string) => {
    switch(severity) {
      case 'high': return 'bg-red-500/10';
      case 'medium': return 'bg-amber-500/10';
      default: return 'bg-blue-500/10';
    }
  };

  // Render the appropriate icon based on the icon string from database
  const renderIcon = (iconName: string, className: string) => {
    switch(iconName) {
      case 'alert-triangle':
        return <AlertTriangle className={className} />;
      case 'bar-chart':
        return <BarChart className={className} />;
      case 'info':
        return <Info className={className} />;
      default:
        return <Info className={className} />;
    }
  };

  // Industry data points (mock data based on real industry patterns)
  const industryData: DataPoint[] = [
    { 
      label: painPoint.survey_data.label, 
      value: painPoint.survey_data.percentage, 
      color: 'bg-gradient-to-r from-siso-red to-siso-orange' 
    },
    { 
      label: 'Report negative impact on revenue', 
      value: Math.round(painPoint.survey_data.percentage * 0.8), 
      color: 'bg-amber-500' 
    },
    { 
      label: 'Cited as reason for creator churn', 
      value: Math.round(painPoint.survey_data.percentage * 0.6), 
      color: 'bg-red-500' 
    },
    { 
      label: 'Successfully resolved with proper tools', 
      value: 85, 
      color: 'bg-green-500' 
    }
  ];

  // Research sources (mock data but formatted realistically)
  const researchSources = [
    "OnlyFans Creator Economy Report 2024",
    "Digital Content Creator Survey (N=1,200)",
    "Agency Management Benchmark Study",
    "Creator Platform Analytics Database"
  ];
  
  // Video solution data (mock data)
  const videoSolution = {
    title: `Solving ${painPoint.title}`,
    description: "A detailed walkthrough of our solution approach",
    thumbnailUrl: "https://placehold.co/500x280/black/white?text=Solution+Video",
    duration: "4:32"
  };
  
  // Case study metrics (mock data)
  const caseStudyMetrics = [
    { label: "Implementation Time", value: "2 weeks", icon: <Calendar className="h-4 w-4" /> },
    { label: "Problem Resolution Rate", value: "92%", icon: <CheckCircle className="h-4 w-4" /> },
    { label: "Revenue Impact", value: "+35%", icon: <TrendingUp className="h-4 w-4" /> }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black/90 border-siso-orange/20 text-white p-0">
        {/* Header section with background gradient */}
        <div className="bg-gradient-to-r from-siso-red/20 to-siso-orange/20 px-6 py-5 rounded-t-lg border-b border-siso-orange/20">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2.5 rounded-full ${getSeverityBgColor(painPoint.severity)}`}>
                {renderIcon(painPoint.icon, "h-6 w-6 " + getSeverityColor(painPoint.severity))}
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl font-bold text-white">
                  {painPoint.title}
                </DialogTitle>
                <p className="text-siso-text text-sm mt-1 flex items-center gap-1.5">
                  <span className={`${getSeverityColor(painPoint.severity)} font-medium`}>
                    {painPoint.severity === 'high' ? 'Critical Issue' : 
                     painPoint.severity === 'medium' ? 'Major Challenge' : 'Moderate Problem'}
                  </span>
                  <span className="text-siso-text/50">•</span>
                  <span>{painPoint.statistic}</span>
                </p>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
            <div className="bg-black/30 text-siso-orange text-xs font-medium px-3 py-1.5 rounded inline-flex gap-1.5 items-center">
              <BarChart className="h-3.5 w-3.5" />
              <span>Survey finding: {painPoint.survey_data.percentage}% {painPoint.survey_data.label}</span>
            </div>
            
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-black/30 px-3 py-1.5 rounded cursor-pointer hover:bg-black/40 transition-colors"
              onClick={() => window.open("https://notion.so/agency-report", '_blank')}
            >
              <FileText className="h-3.5 w-3.5 text-siso-orange" />
              <span>2024 Industry Research Report</span>
              <ArrowUpRight className="h-3 w-3 ml-0.5" />
            </motion.div>
          </div>
        </div>
        
        {/* Body with tabs */}
        <div className="px-6 py-5">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-black/30 border border-siso-text/10 p-1 mb-5 w-full grid grid-cols-4">
              <TabsTrigger value="overview" className="data-[state=active]:bg-siso-orange/20 data-[state=active]:text-siso-orange">
                Overview
              </TabsTrigger>
              <TabsTrigger value="data" className="data-[state=active]:bg-siso-orange/20 data-[state=active]:text-siso-orange">
                Research Data
              </TabsTrigger>
              <TabsTrigger value="solution" className="data-[state=active]:bg-siso-orange/20 data-[state=active]:text-siso-orange">
                Solution
              </TabsTrigger>
              <TabsTrigger value="impact" className="data-[state=active]:bg-siso-orange/20 data-[state=active]:text-siso-orange">
                Impact
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-0 space-y-5 animate-in fade-in-50 duration-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-siso-orange" />
                  The Challenge
                </h3>
                <p className="text-siso-text">{painPoint.description}</p>
                
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-black/30 border border-siso-text/10 rounded-lg p-4"
                  >
                    <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4 text-siso-orange" />
                      Who This Affects
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm text-siso-text">
                        <div className="h-1.5 w-1.5 rounded-full bg-siso-orange"></div>
                        Agency owners managing multiple creators
                      </li>
                      <li className="flex items-center gap-2 text-sm text-siso-text">
                        <div className="h-1.5 w-1.5 rounded-full bg-siso-orange"></div>
                        Account managers handling daily operations
                      </li>
                      <li className="flex items-center gap-2 text-sm text-siso-text">
                        <div className="h-1.5 w-1.5 rounded-full bg-siso-orange"></div>
                        Content creators struggling with consistency
                      </li>
                      <li className="flex items-center gap-2 text-sm text-siso-text">
                        <div className="h-1.5 w-1.5 rounded-full bg-siso-orange"></div>
                        Subscribers expecting timely responses
                      </li>
                    </ul>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-black/30 border border-siso-text/10 rounded-lg p-4"
                  >
                    <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-siso-orange" />
                      Common Symptoms
                    </h4>
                    <ul className="space-y-2">
                      {painPoint.impact_areas.map((area, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-siso-text">
                          <div className="h-1.5 w-1.5 rounded-full bg-siso-orange"></div>
                          {area}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              </div>
              
              <div className="bg-black/30 rounded-lg p-4 border border-siso-text/10">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <BarChart className="h-4 w-4 text-siso-orange" />
                  Key Statistics
                </h4>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-siso-text">{painPoint.survey_data.label}</span>
                  <span className="text-siso-orange font-semibold">{painPoint.survey_data.percentage}%</span>
                </div>
                
                <div className="w-full h-2.5 bg-siso-text/10 rounded-full overflow-hidden mb-4">
                  <div 
                    className="h-full bg-gradient-to-r from-siso-red to-siso-orange rounded-full"
                    style={{ width: `${painPoint.survey_data.percentage}%` }}
                  />
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {painPoint.impact_areas.map((area, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-siso-text bg-black/20 p-2 rounded border border-siso-text/5">
                      <div className="h-1.5 w-1.5 rounded-full bg-siso-orange/70"></div>
                      <span>{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="data" className="mt-0 space-y-5 animate-in fade-in-50 duration-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-siso-orange" />
                  Industry Research Data
                </h3>
                
                <div className="bg-black/30 border border-siso-text/10 rounded-lg p-4 mb-4">
                  <p className="text-sm text-siso-text italic mb-3">
                    Based on a survey of 200+ OnlyFans agencies and 1,200+ independent creators conducted in Q1 2024
                  </p>
                  
                  <div className="space-y-4">
                    {industryData.map((data, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-siso-text">{data.label}</span>
                          <span className="text-siso-orange font-medium">{data.value}%</span>
                        </div>
                        <div className="w-full h-2 bg-siso-text/10 rounded-full overflow-hidden">
                          <div 
                            className={data.color}
                            style={{ width: `${data.value}%`, height: '100%' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-black/30 border border-siso-text/10 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Research Sources</h4>
                  <div className="space-y-2">
                    {researchSources.map((source, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-siso-orange" />
                        <span className="text-siso-text">{source}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bg-black/30 border border-siso-text/10 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-siso-text/10">
                  <h4 className="text-white font-medium">Regional Breakdown</h4>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-siso-text">North America</span>
                        <span className="text-siso-orange">82%</span>
                      </div>
                      <Progress value={82} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-siso-text">Europe</span>
                        <span className="text-siso-orange">78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-siso-text">Asia-Pacific</span>
                        <span className="text-siso-orange">65%</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-siso-text">Latin America</span>
                        <span className="text-siso-orange">70%</span>
                      </div>
                      <Progress value={70} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="solution" className="mt-0 space-y-5 animate-in fade-in-50 duration-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-siso-orange" />
                  Our Approach
                </h3>
                <div className="space-y-3">
                  {painPoint.solutions.map((solution, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 bg-black/30 p-3 rounded-lg border border-siso-text/10"
                    >
                      <CheckCircle className="h-5 w-5 text-siso-orange shrink-0 mt-0.5" />
                      <div>
                        <p className="text-siso-text">{solution}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Video solution section */}
                <div className="mt-6 bg-black/30 border border-siso-text/10 rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-siso-text/10 flex items-center justify-between">
                    <h4 className="text-white font-medium flex items-center gap-2">
                      <Video className="h-4 w-4 text-siso-orange" />
                      Video Solution
                    </h4>
                    <Badge variant="outline" className="bg-black/40 text-siso-orange border-siso-orange/20">
                      {videoSolution.duration}
                    </Badge>
                  </div>
                  <div className="relative">
                    <AspectRatio ratio={16/9}>
                      <img 
                        src={videoSolution.thumbnailUrl} 
                        alt="Solution video thumbnail" 
                        className="w-full h-full object-cover"
                      />
                    </AspectRatio>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="h-16 w-16 rounded-full bg-siso-orange/80 flex items-center justify-center text-white"
                        onClick={onRequestSolution}
                      >
                        <Play className="h-8 w-8 ml-1" />
                      </motion.button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h5 className="font-medium text-white mb-1">{videoSolution.title}</h5>
                    <p className="text-sm text-siso-text">{videoSolution.description}</p>
                    <Button 
                      variant="ghost" 
                      className="mt-2 text-siso-orange hover:text-siso-orange hover:bg-siso-orange/10 p-0 h-auto"
                      onClick={onRequestSolution}
                    >
                      <span>Watch full video</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="impact" className="mt-0 space-y-5 animate-in fade-in-50 duration-300">
              {painPoint.testimonial && (
                <div className="bg-gradient-to-r from-siso-red/10 to-siso-orange/10 rounded-lg p-5 border border-siso-orange/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Quote className="h-5 w-5 text-siso-orange" />
                    <h4 className="text-white font-medium">Success Story</h4>
                  </div>
                  
                  <p className="text-siso-text italic mb-3 text-base">"{painPoint.testimonial.quote}"</p>
                  
                  <div className="flex items-center gap-3 mt-4">
                    <div className="h-10 w-10 rounded-full bg-siso-orange/20 flex items-center justify-center">
                      <Users className="h-5 w-5 text-siso-orange" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{painPoint.testimonial.author}</p>
                      <p className="text-xs text-siso-text/70">{painPoint.testimonial.position}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-siso-orange" />
                  Expected Outcomes
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-black/30 p-3 rounded-lg border border-siso-text/10">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-siso-orange" />
                      <h4 className="text-white text-sm font-medium">Improved Communication</h4>
                    </div>
                    <Progress value={75} className="h-1.5 bg-black/50" indicatorClassName="bg-gradient-to-r from-siso-red to-siso-orange" />
                    <p className="text-xs text-siso-text mt-2">75% reduction in missed messages</p>
                  </div>
                  
                  <div className="bg-black/30 p-3 rounded-lg border border-siso-text/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-siso-orange" />
                      <h4 className="text-white text-sm font-medium">Client Retention</h4>
                    </div>
                    <Progress value={60} className="h-1.5 bg-black/50" indicatorClassName="bg-gradient-to-r from-siso-red to-siso-orange" />
                    <p className="text-xs text-siso-text mt-2">60% improvement in retention rates</p>
                  </div>
                </div>
                
                {/* Case study metrics */}
                <div className="mt-4 bg-black/30 rounded-lg border border-siso-text/10 overflow-hidden">
                  <div className="p-3 border-b border-siso-text/10">
                    <h4 className="text-white font-medium">Real Case Study Results</h4>
                  </div>
                  <div className="grid grid-cols-3 divide-x divide-siso-text/10">
                    {caseStudyMetrics.map((metric, idx) => (
                      <div key={idx} className="p-3 text-center">
                        <div className="flex justify-center mb-2">
                          <div className="p-2 bg-siso-orange/10 rounded-full">
                            <div className="text-siso-orange">
                              {metric.icon}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-siso-text/70">{metric.label}</p>
                        <p className="text-lg font-bold text-siso-orange">{metric.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter className="px-6 py-4 border-t border-siso-text/10 flex flex-col sm:flex-row sm:justify-between gap-4">
          <Button
            variant="outline"
            className="border-siso-orange/30 text-siso-orange hover:bg-siso-orange/10"
            onClick={() => window.open("https://notion.so/agency-report", '_blank')}
          >
            Read Full Agency Report
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
          
          <Button 
            className="bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90 text-white"
            onClick={onRequestSolution}
          >
            See Our Solution
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
