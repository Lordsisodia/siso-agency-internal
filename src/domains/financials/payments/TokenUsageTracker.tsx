import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PieChart, Layers, Code } from 'lucide-react';

interface TokenCategory {
  name: string;
  amount: number;
  icon: React.ReactNode;
  color: string;
}

interface TokenUsageTrackerProps {
  totalTokens: number;
  categories: TokenCategory[];
}

export function TokenUsageTracker({ 
  totalTokens, 
  categories = [
    { 
      name: 'Pricing API',
      amount: 250, 
      icon: <PieChart className="h-4 w-4" />,
      color: 'bg-blue-500'
    },
    { 
      name: 'Setup & UI',
      amount: 350, 
      icon: <Layers className="h-4 w-4" />,
      color: 'bg-purple-500'
    },
    { 
      name: 'Wireframes',
      amount: 200, 
      icon: <Code className="h-4 w-4" />,
      color: 'bg-emerald-500'
    }
  ] 
}: Partial<TokenUsageTrackerProps>) {
  // Calculate percentage for each category
  const categoriesWithPercentage = categories.map(category => ({
    ...category,
    percentage: Math.round((category.amount / totalTokens) * 100)
  }));

  return (
    <Card className="bg-black/20 border border-siso-text/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg">Token Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Tokens Used</span>
            <span className="text-lg font-bold text-siso-orange">{totalTokens}</span>
          </div>
          
          <div className="space-y-3">
            {categoriesWithPercentage.map((category, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-full ${category.color}`}>
                      {category.icon}
                    </div>
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{category.amount}</span>
                    <span className="text-xs text-muted-foreground">({category.percentage}%)</span>
                  </div>
                </div>
                <Progress 
                  value={category.percentage} 
                  className={`h-1.5 ${category.color.replace('bg-', 'bg-opacity-20')} bg-opacity-10`}
                />
              </div>
            ))}
          </div>
          
          <div className="pt-2 border-t border-border">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-siso-bg-alt border border-siso-text/10">
                <p className="text-xs text-muted-foreground">Average Usage</p>
                <p className="text-sm font-medium">42/day</p>
              </div>
              <div className="p-2 rounded-lg bg-siso-bg-alt border border-siso-text/10">
                <p className="text-xs text-muted-foreground">Last 7 days</p>
                <p className="text-sm font-medium">+15%</p>
              </div>
              <div className="p-2 rounded-lg bg-siso-bg-alt border border-siso-text/10">
                <p className="text-xs text-muted-foreground">Available</p>
                <p className="text-sm font-medium">1,200</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 