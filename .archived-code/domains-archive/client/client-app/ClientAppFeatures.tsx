
import React from 'react';  // Add this import at the top of the file
import { Check, Code, Shield, Zap, Users, BarChart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

interface ClientAppFeaturesProps {
  features: string[];
}

export function ClientAppFeatures({ features }: ClientAppFeaturesProps) {
  // Group features into categories
  const featureCategories = {
    core: features.slice(0, Math.ceil(features.length / 3)),
    advanced: features.slice(Math.ceil(features.length / 3), Math.ceil(features.length * 2 / 3)),
    premium: features.slice(Math.ceil(features.length * 2 / 3))
  };

  const categoryIcons = {
    core: Zap,
    advanced: Shield,
    premium: BarChart
  };

  const categoryTitles = {
    core: "Core Features",
    advanced: "Advanced Capabilities",
    premium: "Premium Features"
  };

  return (
    <Card className="bg-black/30 border-siso-text/10">
      <CardContent className="p-8">
        <h2 className="text-xl font-semibold mb-6 text-white">App Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(Object.keys(featureCategories) as Array<keyof typeof featureCategories>).map((category, categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: categoryIndex * 0.1 }}
            >
              <div className="flex items-center gap-2 mb-4">
                {categoryIcons[category] && React.createElement(categoryIcons[category], {
                  className: "h-5 w-5 text-siso-orange"
                })}
                <h3 className="text-lg font-medium text-white">{categoryTitles[category]}</h3>
              </div>

              <div className="space-y-3">
                {featureCategories[category].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: (categoryIndex * 0.1) + (index * 0.05) }}
                    className="flex items-center gap-3 bg-black/20 border border-gray-800 rounded-lg p-3"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-siso-red to-siso-orange flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-white text-sm">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
