
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Calendar, 
  BarChart, 
  MessageSquare, 
  FileText, 
  TrendingUp 
} from 'lucide-react';

interface SolutionProps {
  icon: React.ReactNode;
  title: string;
  problem: string;
  solution: string;
  result: string;
}

interface SolutionsShowcaseProps {
  onSelectSolution: (solution: any) => void;
}

export const SolutionsShowcase = ({ onSelectSolution }: SolutionsShowcaseProps) => {
  const solutions: SolutionProps[] = [
    {
      icon: <Users className="h-10 w-10 text-siso-orange" />,
      title: "Client Management",
      problem: "Agencies struggle with high client churn and manual processes",
      solution: "Streamlined onboarding and retention tools",
      result: "40% increase in client retention"
    },
    {
      icon: <Calendar className="h-10 w-10 text-siso-orange" />,
      title: "Content Scheduling",
      problem: "Content gets lost in spreadsheets and mismanaged",
      solution: "Centralized content calendar with workflow tools",
      result: "60% more content published on time"
    },
    {
      icon: <MessageSquare className="h-10 w-10 text-siso-orange" />,
      title: "Fan Engagement",
      problem: "Fan messages go unanswered, leading to lost subscribers",
      solution: "Unified inbox with priority sorting",
      result: "85% faster response time to fans"
    },
    {
      icon: <BarChart className="h-10 w-10 text-siso-orange" />,
      title: "Performance Analytics",
      problem: "Difficult to demonstrate ROI to creators",
      solution: "Real-time performance dashboards",
      result: "25% increase in subscription revenue"
    },
    {
      icon: <FileText className="h-10 w-10 text-siso-orange" />,
      title: "Document Management",
      problem: "Contracts and important files get lost",
      solution: "Secure cloud storage with version history",
      result: "100% paperwork compliance"
    },
    {
      icon: <TrendingUp className="h-10 w-10 text-siso-orange" />,
      title: "Growth Automation",
      problem: "Manual cross-promotion is time consuming",
      solution: "Automated promotion and engagement tools",
      result: "35% increase in new subscribers"
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {solutions.map((solution, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.4 }}
          onClick={() => onSelectSolution(solution)}
        >
          <Card className="h-full bg-black/20 border-siso-text/10 hover:border-siso-orange/30 transition-all cursor-pointer">
            <CardContent className="p-6">
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <div className="p-3 bg-siso-orange/10 rounded-lg inline-block mb-3">
                    {solution.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{solution.title}</h3>
                  <p className="text-sm text-siso-text mb-2">
                    <span className="text-siso-text/70">Problem:</span> {solution.problem}
                  </p>
                  <p className="text-sm text-siso-text mb-2">
                    <span className="text-siso-text/70">Solution:</span> {solution.solution}
                  </p>
                  <div className="bg-gradient-to-r from-siso-red/10 to-siso-orange/10 rounded-md p-2 border border-siso-orange/20">
                    <p className="text-sm font-medium text-siso-orange">
                      Result: {solution.result}
                    </p>
                  </div>
                </div>
                
                <div className="mt-auto pt-3">
                  <Button 
                    variant="outline" 
                    className="w-full border-siso-orange/30 text-siso-orange hover:bg-siso-orange/10"
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
