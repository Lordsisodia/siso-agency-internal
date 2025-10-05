
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Calculator, Clock, BarChart2, Calendar, Users, Info } from 'lucide-react';
import { PriceSlider } from '@/components/plan/PriceSlider';
import { GradientHeading } from '@/components/ui/gradient-heading';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ROICalculatorProps {
  selectedFeatures: string[];
  featuresTimeEstimate: number;
  tier: string;
  basePrice: number;
}

export const ROICalculator = ({ 
  selectedFeatures, 
  featuresTimeEstimate, 
  tier, 
  basePrice 
}: ROICalculatorProps) => {
  // Sliders state
  const [creatorCount, setCreatorCount] = useState(10);
  const [avgRevenue, setAvgRevenue] = useState(5000);
  const [growthRate, setGrowthRate] = useState(10);
  const [hoursPerWeek, setHoursPerWeek] = useState(20);
  const [timeFrameMonths, setTimeFrameMonths] = useState(12);
  
  // Calculated values
  const [monthlySavings, setMonthlySavings] = useState(0);
  const [projectedIncrease, setProjectedIncrease] = useState(0);
  const [totalROI, setTotalROI] = useState(0);
  const [paybackPeriod, setPaybackPeriod] = useState(0);
  
  // Calculate ROI based on inputs
  useEffect(() => {
    // Calculate time savings
    const hourlyRate = 30; // Assumed hourly rate for staff
    const timeSavingsPerWeek = hoursPerWeek * 0.4; // Assume 40% time savings
    const monthlySavings = timeSavingsPerWeek * 4 * hourlyRate;
    setMonthlySavings(monthlySavings);
    
    // Calculate projected revenue increase
    const monthlyRevenue = avgRevenue * creatorCount;
    const revenueFactor = (tier === 'mvp' ? 0.15 : tier === 'advanced' ? 0.25 : 0.35);
    const monthlyIncrease = monthlyRevenue * (growthRate / 100) * revenueFactor;
    setProjectedIncrease(monthlyIncrease);
    
    // Calculate total ROI
    const totalCost = basePrice + (tier === 'advanced' ? 249 * timeFrameMonths : tier === 'premium' ? 499 * timeFrameMonths : 0);
    const totalBenefit = (monthlySavings + monthlyIncrease) * timeFrameMonths;
    const roi = ((totalBenefit - totalCost) / totalCost) * 100;
    setTotalROI(Math.max(0, roi));
    
    // Calculate payback period (in months)
    const monthlyBenefit = monthlySavings + monthlyIncrease;
    const payback = monthlyBenefit > 0 ? basePrice / monthlyBenefit : 0;
    setPaybackPeriod(Math.min(timeFrameMonths, payback));
    
  }, [creatorCount, avgRevenue, growthRate, hoursPerWeek, tier, basePrice, timeFrameMonths]);
  
  // Helper function to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);
  };
  
  // Get ROI color based on value
  const getRoiColor = (roi: number) => {
    if (roi >= 200) return "text-green-500";
    if (roi >= 100) return "text-siso-orange";
    return "text-siso-red";
  };
  
  return (
    <TooltipProvider>
      <div className="bg-black/20 border border-siso-text/10 rounded-lg p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-full bg-siso-orange/10 p-3">
            <Calculator className="h-5 w-5 text-siso-orange" />
          </div>
          <div>
            <GradientHeading className="text-xl font-semibold" variant="primary">
              ROI Calculator
            </GradientHeading>
            <p className="text-siso-text">
              Estimate your return on investment with {selectedFeatures.length} features
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input sliders */}
          <div className="space-y-6">
            <h3 className="text-md font-medium text-white mb-3 flex items-center">
              <Users className="h-4 w-4 mr-2 text-siso-orange" />
              Your Business Details
            </h3>
            
            <PriceSlider
              label="Number of Creators"
              value={creatorCount}
              onChange={setCreatorCount}
              min={1}
              max={100}
              description="How many OnlyFans creators you manage"
            />
            
            <PriceSlider
              label="Average Monthly Revenue per Creator"
              value={avgRevenue}
              onChange={setAvgRevenue}
              min={1000}
              max={20000}
              step={500}
              unit="£"
              description="Average monthly earnings per creator"
            />
            
            <PriceSlider
              label="Target Growth Rate"
              value={growthRate}
              onChange={setGrowthRate}
              min={5}
              max={50}
              unit="%"
              description="Your target growth percentage in the next year"
            />
            
            <PriceSlider
              label="Current Admin Hours Per Week"
              value={hoursPerWeek}
              onChange={setHoursPerWeek}
              min={5}
              max={80}
              unit=" hrs"
              description="Hours spent on administrative tasks weekly"
            />
            
            <PriceSlider
              label="Timeframe for ROI Calculation"
              value={timeFrameMonths}
              onChange={setTimeFrameMonths}
              min={3}
              max={36}
              step={3}
              unit=" months"
              description="Period to calculate total return on investment"
            />
          </div>
          
          {/* Results */}
          <div className="space-y-6">
            <h3 className="text-md font-medium text-white mb-3 flex items-center">
              <BarChart2 className="h-4 w-4 mr-2 text-siso-orange" />
              Projected Results
            </h3>
            
            <Tabs defaultValue="monthly" className="mb-4">
              <TabsList className="grid grid-cols-3 bg-black/30">
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly</TabsTrigger>
                <TabsTrigger value="total">Total ROI</TabsTrigger>
              </TabsList>
              
              <TabsContent value="monthly" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-black/30 rounded-lg p-4 border border-siso-text/10">
                    <div className="flex items-center mb-2">
                      <Clock className="h-4 w-4 text-siso-orange mr-2" />
                      <h4 className="text-white font-medium">Monthly Time Savings</h4>
                    </div>
                    <p className="text-2xl font-bold text-siso-orange">
                      {formatCurrency(monthlySavings)}
                    </p>
                    <p className="text-xs text-siso-text mt-1">
                      Based on {Math.round(hoursPerWeek * 0.4 * 4)} hours saved per month
                    </p>
                  </div>
                  
                  <div className="bg-black/30 rounded-lg p-4 border border-siso-text/10">
                    <div className="flex items-center mb-2">
                      <TrendingUp className="h-4 w-4 text-siso-orange mr-2" />
                      <h4 className="text-white font-medium">Monthly Revenue Increase</h4>
                    </div>
                    <p className="text-2xl font-bold text-siso-orange">
                      {formatCurrency(projectedIncrease)}
                    </p>
                    <p className="text-xs text-siso-text mt-1">
                      Based on {growthRate}% growth optimization
                    </p>
                  </div>
                </div>
                
                <div className="bg-black/30 rounded-lg p-4 border border-siso-text/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-siso-orange mr-2" />
                      <h4 className="text-white font-medium">Total Monthly Benefit</h4>
                    </div>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-siso-text hover:text-white transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">Combined monthly savings and revenue increase</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-3xl font-bold text-siso-orange">
                    {formatCurrency(monthlySavings + projectedIncrease)}
                  </p>
                  <p className="text-xs text-siso-text mt-1">
                    vs Monthly Cost: {formatCurrency(tier === 'mvp' ? 0 : tier === 'advanced' ? 249 : 499)}
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="yearly" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-black/30 rounded-lg p-4 border border-siso-text/10">
                    <div className="flex items-center mb-2">
                      <Clock className="h-4 w-4 text-siso-orange mr-2" />
                      <h4 className="text-white font-medium">Yearly Time Savings</h4>
                    </div>
                    <p className="text-2xl font-bold text-siso-orange">
                      {formatCurrency(monthlySavings * 12)}
                    </p>
                    <p className="text-xs text-siso-text mt-1">
                      Based on {Math.round(hoursPerWeek * 0.4 * 52)} hours saved per year
                    </p>
                  </div>
                  
                  <div className="bg-black/30 rounded-lg p-4 border border-siso-text/10">
                    <div className="flex items-center mb-2">
                      <TrendingUp className="h-4 w-4 text-siso-orange mr-2" />
                      <h4 className="text-white font-medium">Yearly Revenue Increase</h4>
                    </div>
                    <p className="text-2xl font-bold text-siso-orange">
                      {formatCurrency(projectedIncrease * 12)}
                    </p>
                    <p className="text-xs text-siso-text mt-1">
                      Based on {growthRate}% growth optimization
                    </p>
                  </div>
                </div>
                
                <div className="bg-black/30 rounded-lg p-4 border border-siso-text/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-siso-orange mr-2" />
                      <h4 className="text-white font-medium">Total Yearly Benefit</h4>
                    </div>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-siso-text hover:text-white transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">Combined yearly savings and revenue increase</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-3xl font-bold text-siso-orange">
                    {formatCurrency((monthlySavings + projectedIncrease) * 12)}
                  </p>
                  <p className="text-xs text-siso-text mt-1">
                    vs Yearly Cost: {formatCurrency((tier === 'mvp' ? 0 : tier === 'advanced' ? 249 : 499) * 12 + basePrice)}
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="total" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-black/30 rounded-lg p-4 border border-siso-text/10">
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 text-siso-orange mr-2" />
                      <h4 className="text-white font-medium">Payback Period</h4>
                    </div>
                    <p className="text-2xl font-bold text-siso-orange">
                      {paybackPeriod.toFixed(1)} months
                    </p>
                    <p className="text-xs text-siso-text mt-1">
                      Time to recover your investment
                    </p>
                  </div>
                  
                  <div className="bg-black/30 rounded-lg p-4 border border-siso-text/10">
                    <div className="flex items-center mb-2">
                      <DollarSign className="h-4 w-4 text-siso-orange mr-2" />
                      <h4 className="text-white font-medium">Net Benefit</h4>
                    </div>
                    <p className="text-2xl font-bold text-siso-orange">
                      {formatCurrency((monthlySavings + projectedIncrease) * timeFrameMonths - basePrice - (tier === 'mvp' ? 0 : tier === 'advanced' ? 249 : 499) * timeFrameMonths)}
                    </p>
                    <p className="text-xs text-siso-text mt-1">
                      Total benefit minus cost over {timeFrameMonths} months
                    </p>
                  </div>
                </div>
                
                <div className="bg-black/30 rounded-lg p-4 border border-siso-text/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <BarChart2 className="h-4 w-4 text-siso-orange mr-2" />
                      <h4 className="text-white font-medium">Return on Investment (ROI)</h4>
                    </div>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-siso-text hover:text-white transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">(Total Benefits - Total Costs) / Total Costs × 100%</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className={cn("text-3xl font-bold", getRoiColor(totalROI))}>
                    {totalROI.toFixed(0)}%
                  </p>
                  <p className="text-xs text-siso-text mt-1">
                    Over {timeFrameMonths} months with {selectedFeatures.length} features
                  </p>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="bg-siso-orange/10 rounded-lg p-4 border border-siso-orange/30">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-siso-orange shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-semibold mb-1">Your Business Impact</h4>
                  <p className="text-sm text-siso-text mb-3">
                    Based on your inputs and selected features, our platform could generate up to {formatCurrency((monthlySavings + projectedIncrease) * timeFrameMonths)} in combined savings and revenue over {timeFrameMonths} months.
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-siso-orange text-siso-orange hover:bg-siso-orange/10"
                    onClick={() => {
                      // Could link to more detailed analysis or case studies
                      window.open('/case-studies', '_blank');
                    }}
                  >
                    View Agency Success Stories
                    <TrendingUp className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
