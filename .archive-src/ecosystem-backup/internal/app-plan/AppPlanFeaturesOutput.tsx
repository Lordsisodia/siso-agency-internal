import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Separator } from '@/shared/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible';
import { GeneratedAppPlan, FeaturePlan } from '@/types/appPlan.types';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Zap, 
  Lightbulb, 
  Layers, 
  CheckCircle, 
  ChevronDown,
  ChevronUp,
  Download,
  ArrowRight,
  Check,
  PlusCircle
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface AppPlanFeaturesOutputProps {
  plan: GeneratedAppPlan;
  isNewlyGenerated?: boolean;
}

export function AppPlanFeaturesOutput({ plan, isNewlyGenerated = false }: AppPlanFeaturesOutputProps) {
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

  // Group features by priority
  const highPriorityFeatures = plan.features.filter(feature => feature.priority === 'high');
  const mediumPriorityFeatures = plan.features.filter(feature => feature.priority === 'medium');
  const lowPriorityFeatures = plan.features.filter(feature => feature.priority === 'low');
  
  // Get recommended MVP features
  const mvpFeatures = plan.recommendedMVPFeatures.map(id => 
    plan.features.find(feature => feature.id === id)
  ).filter(Boolean) as FeaturePlan[];

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial={isNewlyGenerated ? "hidden" : "visible"}
      animate="visible"
    >
      {/* Header with App Name and Summary */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-500" />
                {plan.businessName} App Features
              </CardTitle>
              <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30">
                AI Generated
              </Badge>
            </div>
            <CardDescription className="text-gray-300 mt-1">
              Based on your business requirements, we've identified the following key features for your app.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 items-center">
                <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                  <Check className="h-3 w-3 mr-1" /> 
                  {highPriorityFeatures.length} Essential Features
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  <Check className="h-3 w-3 mr-1" />
                  {mediumPriorityFeatures.length} Recommended Features
                </Badge>
                {lowPriorityFeatures.length > 0 && (
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    <PlusCircle className="h-3 w-3 mr-1" />
                    {lowPriorityFeatures.length} Additional Features
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* MVP Features Section */}
      {mvpFeatures.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="bg-orange-950/20 border border-orange-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-400" />
                Recommended MVP Features
              </CardTitle>
              <CardDescription className="text-gray-300">
                These core features should be prioritized for your initial app release
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-2">
              <div className="grid grid-cols-1 gap-3">
                {mvpFeatures.map(feature => (
                  <MVPFeatureItem key={feature.id} feature={feature} />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Essential Features */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gray-800 border border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-red-400" />
              Essential Features
            </CardTitle>
            <CardDescription className="text-gray-300">
              These high-priority features are critical for your app's core functionality
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-2">
            <div className="space-y-3">
              {highPriorityFeatures.map(feature => (
                <FeatureCard key={feature.id} feature={feature} />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recommended Features */}
      {mediumPriorityFeatures.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="bg-gray-800 border border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-400" />
                Recommended Features
              </CardTitle>
              <CardDescription className="text-gray-300">
                These features will enhance your app's value and user experience
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-2">
              <div className="space-y-3">
                {mediumPriorityFeatures.map(feature => (
                  <FeatureCard key={feature.id} feature={feature} />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Additional Features */}
      {lowPriorityFeatures.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="bg-gray-800 border border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-purple-400" />
                Additional Features
              </CardTitle>
              <CardDescription className="text-gray-300">
                Consider these features for future updates to further enhance your app
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-2">
              <div className="space-y-3">
                {lowPriorityFeatures.map(feature => (
                  <FeatureCard key={feature.id} feature={feature} />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Actions Footer */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gray-800 border border-gray-700">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-gray-400">
                Generated using AI analysis of your business requirements
              </p>
              
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="border-gray-700 text-gray-300">
                  <Download className="h-4 w-4 mr-2" />
                  Export Features
                </Button>
                
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                  Continue to Development
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// MVP Feature Item Component
function MVPFeatureItem({ feature }: { feature: FeaturePlan }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-orange-950/40 border border-orange-500/40 rounded-lg hover:bg-orange-950/50 transition-colors">
      <div className="mt-0.5">
        <Zap className="h-5 w-5 text-orange-400" />
      </div>
      <div>
        <h4 className="font-semibold text-orange-100">{feature.name}</h4>
        <p className="text-sm text-orange-200/90">{feature.description}</p>
      </div>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ feature }: { feature: FeaturePlan }) {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="p-3 bg-gray-900 rounded-lg border border-gray-700"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Badge 
            variant="outline" 
            className={cn(
              "mt-0.5 px-2 min-w-16 text-center",
              feature.priority === 'high' && "bg-red-500/20 text-red-300 border-red-500/30",
              feature.priority === 'medium' && "bg-blue-500/20 text-blue-300 border-blue-500/30",
              feature.priority === 'low' && "bg-purple-500/20 text-purple-300 border-purple-500/30"
            )}
          >
            {feature.priority === 'high' ? 'Essential' : 
             feature.priority === 'medium' ? 'Recommended' : 'Additional'}
          </Badge>
          <div>
            <h4 className="font-medium text-white">{feature.name}</h4>
            <p className="text-sm text-gray-300 line-clamp-2">
              {feature.description}
            </p>
          </div>
        </div>
        
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent className="mt-2 pt-2 border-t border-gray-700">
        {feature.userStories && feature.userStories.length > 0 && (
          <div className="mt-2">
            <h5 className="text-xs font-medium text-gray-400 mb-1">User Stories:</h5>
            <ul className="space-y-1">
              {feature.userStories.map((story, idx) => (
                <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-orange-400 mt-0.5">•</span>
                  <span>{story}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-400">
          <span className="px-2 py-0.5 bg-gray-800 rounded-full capitalize">{feature.complexity} complexity</span>
          {feature.estimatedHours && (
            <span className="px-2 py-0.5 bg-gray-800 rounded-full">{feature.estimatedHours} hours</span>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
} 