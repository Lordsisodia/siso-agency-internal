import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { GeneratedAppPlan, FeaturePlan, DevelopmentPhase } from '@/types/appPlan.types';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Code, 
  Zap, 
  Clock, 
  DollarSign, 
  Users, 
  Lightbulb, 
  Layers, 
  CheckCircle, 
  AlertCircle, 
  BarChart, 
  PaintBucket,
  Cpu,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppPlanFormattedOutputProps {
  plan: GeneratedAppPlan;
  isNewlyGenerated?: boolean;
}

export function AppPlanFormattedOutput({ plan, isNewlyGenerated = false }: AppPlanFormattedOutputProps) {
  
  // Helper function for formatting currency
  const formatCurrency = (amount: number, currency: string = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Motion animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  // Determine confidence level color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return "text-green-400";
    if (confidence >= 70) return "text-yellow-400";
    return "text-orange-500";
  };

  // Priority badge styling
  const getPriorityBadgeStyle = (priority: string) => {
    switch(priority.toLowerCase()) {
      case 'high': 
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case 'medium': 
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case 'low': 
        return "bg-green-500/20 text-green-300 border-green-500/30";
      default: 
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial={isNewlyGenerated ? "hidden" : "visible"}
      animate="visible"
    >
      {/* Executive Summary */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
              <FileText className="h-5 w-5 text-orange-500" />
              {plan.businessName} App Plan
              <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30">
                {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
              </Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-300 leading-relaxed">
                {plan.executiveSummary}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <Zap className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-400">Confidence</p>
                    <p className={cn("font-semibold", getConfidenceColor(plan.confidence))}>
                      {plan.confidence}%
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <Clock className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-400">Timeline</p>
                    <p className="text-white font-semibold">{plan.totalTimelineWeeks} weeks</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <DollarSign className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-sm text-gray-400">Budget</p>
                    <p className="text-white font-semibold">
                      {formatCurrency(plan.costBreakdown.total, plan.costBreakdown.currency)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <Lightbulb className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-400">Features</p>
                    <p className="text-white font-semibold">{plan.features.length} planned</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabbed Content */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="features" className="w-full">
          <TabsList className="grid grid-cols-5 bg-gray-800 border border-gray-700 p-1 w-full mb-6">
            <TabsTrigger value="features" className="data-[state=active]:bg-gray-700">
              <Layers className="h-4 w-4 mr-2" />
              Features
            </TabsTrigger>
            <TabsTrigger value="technical" className="data-[state=active]:bg-gray-700">
              <Cpu className="h-4 w-4 mr-2" />
              Technical
            </TabsTrigger>
            <TabsTrigger value="timeline" className="data-[state=active]:bg-gray-700">
              <Clock className="h-4 w-4 mr-2" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="costs" className="data-[state=active]:bg-gray-700">
              <BarChart className="h-4 w-4 mr-2" />
              Costs
            </TabsTrigger>
            <TabsTrigger value="design" className="data-[state=active]:bg-gray-700">
              <PaintBucket className="h-4 w-4 mr-2" />
              Design
            </TabsTrigger>
          </TabsList>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <Card className="bg-gray-800 border border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white">Key Features</CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  {/* High Priority Features */}
                  <div>
                    <h3 className="text-md font-semibold text-white mb-3 flex items-center">
                      <Badge className="bg-red-500/20 text-red-300 border-red-500/30 mr-2">
                        High Priority
                      </Badge>
                      Must-Have Features
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {plan.features
                        .filter(feature => feature.priority === 'high')
                        .map((feature) => (
                          <FeatureCard key={feature.id} feature={feature} />
                        ))}
                    </div>
                  </div>
                  
                  {/* Medium Priority Features */}
                  <div>
                    <h3 className="text-md font-semibold text-white mb-3 flex items-center">
                      <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 mr-2">
                        Medium Priority
                      </Badge>
                      Should-Have Features
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {plan.features
                        .filter(feature => feature.priority === 'medium')
                        .map((feature) => (
                          <FeatureCard key={feature.id} feature={feature} />
                        ))}
                    </div>
                  </div>
                  
                  {/* Low Priority Features */}
                  {plan.features.some(feature => feature.priority === 'low') && (
                    <div>
                      <h3 className="text-md font-semibold text-white mb-3 flex items-center">
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30 mr-2">
                          Low Priority
                        </Badge>
                        Nice-to-Have Features
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {plan.features
                          .filter(feature => feature.priority === 'low')
                          .map((feature) => (
                            <FeatureCard key={feature.id} feature={feature} />
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Technical Tab */}
          <TabsContent value="technical" className="space-y-6">
            <Card className="bg-gray-800 border border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white">Technical Architecture</CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Platform & Architecture */}
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                      <h3 className="text-md font-semibold text-white mb-2">Recommended Platform</h3>
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-sm">
                        {plan.technicalRequirements.platform}
                      </Badge>
                      <p className="text-gray-400 mt-2 text-sm">{plan.technicalRequirements.architecture}</p>
                    </div>
                    
                    <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                      <h3 className="text-md font-semibold text-white mb-2">Security & Compliance</h3>
                      <div className="flex flex-wrap gap-2">
                        {plan.technicalRequirements.security.map((item, index) => (
                          <Badge key={index} className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Tech Stack */}
                  <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                    <h3 className="text-md font-semibold text-white mb-3">Technology Stack</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Frontend</p>
                        <div className="flex flex-wrap gap-2">
                          {plan.technicalRequirements.techStack.frontend.map((tech, index) => (
                            <Badge key={index} className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Backend</p>
                        <div className="flex flex-wrap gap-2">
                          {plan.technicalRequirements.techStack.backend.map((tech, index) => (
                            <Badge key={index} className="bg-green-500/20 text-green-300 border-green-500/30">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Database</p>
                        <div className="flex flex-wrap gap-2">
                          {plan.technicalRequirements.techStack.database.map((tech, index) => (
                            <Badge key={index} className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Integrations</p>
                        <div className="flex flex-wrap gap-2">
                          {plan.technicalRequirements.integrations.map((integration, index) => (
                            <Badge key={index} className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                              {integration}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <Card className="bg-gray-800 border border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white">Development Timeline</CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-5">
                  {plan.developmentPhases.map((phase, index) => (
                    <PhaseCard key={phase.id} phase={phase} index={index} />
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-orange-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-1">MVP Recommendation</h4>
                      <p className="text-sm text-gray-300">
                        We recommend launching an MVP within {plan.mvpTimelineWeeks} weeks focusing on these key features:
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {plan.recommendedMVPFeatures.map((featureId, idx) => {
                          const feature = plan.features.find(f => f.id === featureId);
                          return feature ? (
                            <Badge key={idx} className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                              {feature.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Costs Tab */}
          <TabsContent value="costs" className="space-y-6">
            <Card className="bg-gray-800 border border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white">Cost Breakdown</CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cost Breakdown Chart */}
                  <div className="space-y-4">
                    {Object.entries(plan.costBreakdown)
                      .filter(([key]) => key !== 'total' && key !== 'currency')
                      .map(([category, amount]) => {
                        const percentage = Math.round((amount / plan.costBreakdown.total) * 100);
                        return (
                          <div key={category} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <p className="text-sm text-gray-300 capitalize">{category}</p>
                              <p className="text-sm font-medium text-white">
                                {formatCurrency(amount, plan.costBreakdown.currency)}
                              </p>
                            </div>
                            <Progress value={percentage} className="h-2 bg-gray-700" 
                              indicatorClassName="bg-gradient-to-r from-orange-500 to-pink-500" />
                            <p className="text-xs text-gray-400 text-right">{percentage}%</p>
                          </div>
                        );
                      })}
                  </div>
                  
                  {/* Total & Summary */}
                  <div className="space-y-4">
                    <div className="p-5 bg-gray-900 rounded-lg border border-gray-700">
                      <p className="text-sm text-gray-400 mb-1">Total Investment</p>
                      <p className="text-3xl font-bold text-white">
                        {formatCurrency(plan.costBreakdown.total, plan.costBreakdown.currency)}
                      </p>
                    </div>
                    
                    <Accordion type="single" collapsible className="bg-gray-900 rounded-lg border border-gray-700">
                      <AccordionItem value="roi" className="border-b-0">
                        <AccordionTrigger className="px-5 py-4 text-white hover:bg-gray-800 rounded-t-lg">
                          Business Value & ROI
                        </AccordionTrigger>
                        <AccordionContent className="px-5 pb-4 text-gray-300">
                          <p className="mb-2">This investment is projected to provide:</p>
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>Enhanced customer engagement and retention</li>
                            <li>Streamlined business operations and reduced overhead</li>
                            <li>Competitive advantage in your market</li>
                            <li>Potential for increased revenue through new digital channels</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-1">Value Assessment</h4>
                          <p className="text-sm text-gray-300">
                            Based on industry benchmarks and your business requirements, this investment 
                            aligns with market rates for quality development with a strong ROI potential.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Design Tab */}
          <TabsContent value="design" className="space-y-6">
            <Card className="bg-gray-800 border border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white">UI/UX Strategy</CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Design System */}
                  <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                    <h3 className="text-md font-semibold text-white mb-3">Design System</h3>
                    <p className="text-gray-300 mb-3 text-sm">{plan.uiuxPlan.designSystem}</p>
                    
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Color Scheme</p>
                        <p className="text-sm text-white">{plan.uiuxPlan.colorScheme}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Typography</p>
                        <p className="text-sm text-white">{plan.uiuxPlan.typography}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Accessibility */}
                  <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                    <h3 className="text-md font-semibold text-white mb-3">Accessibility Features</h3>
                    <div className="space-y-2">
                      {plan.uiuxPlan.accessibility.map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                          <p className="text-sm text-gray-300">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* User Flow */}
                <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
                  <h3 className="text-md font-semibold text-white mb-3">User Flow</h3>
                  <div className="flex items-center gap-2 overflow-x-auto pb-3">
                    {plan.uiuxPlan.userFlow.map((step, index) => (
                      <React.Fragment key={index}>
                        <div className="min-w-fit p-2 bg-gray-800 rounded border border-gray-700">
                          <p className="text-sm text-gray-300 whitespace-nowrap">{step}</p>
                        </div>
                        {index < plan.uiuxPlan.userFlow.length - 1 && (
                          <div className="text-gray-600">→</div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Actions Footer */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gray-800 border border-gray-700">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  v{plan.version}
                </Badge>
                <p className="text-sm text-gray-400">
                  Generated {new Date(plan.generatedAt).toLocaleDateString()} with {plan.modelUsed}
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="border-gray-700 text-gray-300">
                  <Download className="h-4 w-4 mr-2" />
                  Export Plan
                </Button>
                
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                  Continue to Development
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// Feature Card Component
function FeatureCard({ feature }: { feature: FeaturePlan }) {
  return (
    <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-white">{feature.name}</h4>
        <Badge 
          variant="outline" 
          className={cn(
            feature.priority === 'high' && "bg-red-500/20 text-red-300 border-red-500/30",
            feature.priority === 'medium' && "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
            feature.priority === 'low' && "bg-green-500/20 text-green-300 border-green-500/30"
          )}
        >
          {feature.priority}
        </Badge>
      </div>
      
      <p className="text-sm text-gray-300 mb-3">{feature.description}</p>
      
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
        <span className="px-2 py-0.5 bg-gray-800 rounded-full">{feature.estimatedHours} hours</span>
        <span>•</span>
        <span className="px-2 py-0.5 bg-gray-800 rounded-full capitalize">{feature.complexity}</span>
      </div>
    </div>
  );
}

// Development Phase Card Component
function PhaseCard({ phase, index }: { phase: DevelopmentPhase, index: number }) {
  return (
    <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-semibold">
          {index + 1}
        </div>
        <div>
          <h4 className="font-semibold text-white">{phase.name}</h4>
          <p className="text-xs text-gray-400">{phase.estimatedDuration}</p>
        </div>
      </div>
      
      <p className="text-sm text-gray-300 mb-3">{phase.description}</p>
      
      <div>
        <p className="text-xs font-medium text-gray-400 mb-2">Deliverables:</p>
        <div className="flex flex-wrap gap-2">
          {phase.deliverables.map((deliverable, idx) => (
            <Badge key={idx} variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30">
              {deliverable}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
} 