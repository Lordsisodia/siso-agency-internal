import { memo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, DollarSign, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const CommissionCalculator = memo(() => {
  const [projectValue, setProjectValue] = useState([999]);
  const [dealsPerMonth, setDealsPerMonth] = useState([2]);
  const [isAnimating, setIsAnimating] = useState(false);

  const commission = Math.round(projectValue[0] * 0.2 * 100) / 100;
  const monthlyEarnings = Math.round(commission * dealsPerMonth[0] * 100) / 100;
  const yearlyEarnings = Math.round(monthlyEarnings * 12 * 100) / 100;

  // Animation trigger when values change
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [projectValue, dealsPerMonth]);

  const getPerformanceLevel = (monthly: number) => {
    if (monthly >= 2000) return { level: 'Elite', color: 'bg-purple-500', icon: '🏆' };
    if (monthly >= 1500) return { level: 'Expert', color: 'bg-orange-500', icon: '⭐' };
    if (monthly >= 1000) return { level: 'Advanced', color: 'bg-green-500', icon: '🚀' };
    if (monthly >= 500) return { level: 'Growing', color: 'bg-blue-500', icon: '📈' };
    return { level: 'Starter', color: 'bg-gray-500', icon: '🌱' };
  };

  const performance = getPerformanceLevel(monthlyEarnings);

  const projectTiers = [
    { min: 249, max: 499, name: 'Starter', commission: '£49 - £99' },
    { min: 500, max: 999, name: 'Standard', commission: '£100 - £199' },
    { min: 1000, max: 1999, name: 'Premium', commission: '£200 - £399' },
    { min: 2000, max: 2490, name: 'Enterprise', commission: '£400 - £498' }
  ];

  const getCurrentTier = () => {
    return projectTiers.find(tier => 
      projectValue[0] >= tier.min && projectValue[0] <= tier.max
    ) || projectTiers[0];
  };

  const currentTier = getCurrentTier();

  const handleApplyNow = () => {
    const element = document.getElementById('application');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="calculator" className="relative min-h-screen flex items-center px-4 overflow-hidden">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/60 via-gray-800/40 to-gray-900/60" />
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[800px] h-[400px] 
        bg-gradient-to-b from-green-500/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[200px] 
        bg-gradient-to-t from-orange-500/10 to-transparent rounded-full blur-2xl" />
      
      <div className="container mx-auto max-w-6xl relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.h2 
            className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-8 leading-tight"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Calculate Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400">
              Earning Potential
            </span>
          </motion.h2>
          <motion.p 
            className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            See exactly how much you could earn with our partnership program
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          {/* Enhanced Calculator Controls */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{ scale: 1.02, y: -4 }}
          >
            <Card className="relative bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-gray-900/80 
                                border border-gray-700/50 hover:border-orange-500/60 backdrop-blur-md
              transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/20">
              
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 
                opacity-0 hover:opacity-100 transition-all duration-500 pointer-events-none" />
              
              <CardContent className="relative p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Commission Calculator</h3>
                </div>

                {/* Project Value Slider */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-white font-semibold">Project Value</label>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-orange-500">£{projectValue[0]}</span>
                      <Badge className={currentTier.name === 'Enterprise' ? 'bg-purple-500' : 'bg-orange-500'}>
                        {currentTier.name}
                      </Badge>
                    </div>
                  </div>
                  <Slider
                    value={projectValue}
                    onValueChange={setProjectValue}
                    max={2490}
                    min={249}
                    step={50}
                    className="w-full touch-manipulation
                      [&>*]:h-8 [&>*]:w-8 md:[&>*]:h-6 md:[&>*]:w-6 
                      [&_[role=slider]]:h-8 [&_[role=slider]]:w-8 md:[&_[role=slider]]:h-6 md:[&_[role=slider]]:w-6 
                      [&_[role=slider]]:border-2 [&_[role=slider]]:border-orange-500 
                      [&_[role=slider]]:bg-white [&_[role=slider]]:shadow-lg
                      [&_.slider-track]:h-3 md:[&_.slider-track]:h-2 [&_.slider-range]:bg-orange-500
                      cursor-pointer [&_[role=slider]]:cursor-grab [&_[role=slider]:active]:cursor-grabbing"
                  />
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>£249 (Minimum)</span>
                    <span>£2,490 (Maximum)</span>
                  </div>
                </div>

                {/* Deals Per Month Slider */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-white font-semibold">Deals Per Month</label>
                    <span className="text-2xl font-bold text-green-500">{dealsPerMonth[0]}</span>
                  </div>
                  <Slider
                    value={dealsPerMonth}
                    onValueChange={setDealsPerMonth}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full touch-manipulation
                      [&>*]:h-8 [&>*]:w-8 md:[&>*]:h-6 md:[&>*]:w-6 
                      [&_[role=slider]]:h-8 [&_[role=slider]]:w-8 md:[&_[role=slider]]:h-6 md:[&_[role=slider]]:w-6 
                      [&_[role=slider]]:border-2 [&_[role=slider]]:border-green-500 
                      [&_[role=slider]]:bg-white [&_[role=slider]]:shadow-lg
                      [&_.slider-track]:h-3 md:[&_.slider-track]:h-2 [&_.slider-range]:bg-green-500
                      cursor-pointer [&_[role=slider]]:cursor-grab [&_[role=slider]:active]:cursor-grabbing"
                  />
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>1 deal</span>
                    <span>10 deals</span>
                  </div>
                </div>

                {/* Project Tier Info */}
                <Card className="bg-gray-700/50 border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Commission Range for {currentTier.name} tier:</span>
                      <span className="text-orange-500 font-semibold">{currentTier.commission}</span>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Results Display */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{ scale: 1.02, y: -4 }}
          >
            <Card className="relative bg-gradient-to-br from-gray-800/80 via-gray-700/60 to-gray-900/80 
                                border border-gray-700/50 hover:border-green-500/60 backdrop-blur-md
              transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/20">
              
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 
                opacity-0 hover:opacity-100 transition-all duration-500 pointer-events-none" />
              
              <CardContent className="relative p-4 sm:p-6 lg:p-8 space-y-4 lg:space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Your Earnings</h3>
                </div>

                {/* Performance Level Badge */}
                <div className="flex items-center justify-center mb-6">
                  <Badge className={`${performance.color} text-white px-4 py-2 text-lg`}>
                    {performance.icon} {performance.level} Partner
                  </Badge>
                </div>

                {/* Commission Per Deal */}
                <motion.div
                  key={commission}
                  initial={isAnimating ? { scale: 1.1, opacity: 0.7 } : false}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center space-y-2"
                >
                  <div className="text-sm text-gray-400">Commission Per Deal</div>
                  <div className="text-4xl font-bold text-orange-500">£{commission}</div>
                  <div className="text-gray-300">20% of project value</div>
                </motion.div>

                {/* Monthly & Yearly Projections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div
                    key={monthlyEarnings}
                    initial={isAnimating ? { y: 10, opacity: 0.7 } : false}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="bg-gray-700/50 rounded-lg p-4 text-center"
                  >
                    <div className="text-sm text-gray-400 mb-1">Monthly</div>
                    <div className="text-2xl font-bold text-green-400">£{monthlyEarnings.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{dealsPerMonth[0]} deal{dealsPerMonth[0] > 1 ? 's' : ''}/month</div>
                  </motion.div>

                  <motion.div
                    key={yearlyEarnings}
                    initial={isAnimating ? { y: 10, opacity: 0.7 } : false}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="bg-gray-700/50 rounded-lg p-4 text-center"
                  >
                    <div className="text-sm text-gray-400 mb-1">Yearly</div>
                    <div className="text-2xl font-bold text-blue-400">£{yearlyEarnings.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Projected annual</div>
                  </motion.div>
                </div>

                {/* Growth Potential */}
                <Card className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-orange-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-orange-500" />
                      <span className="text-orange-500 font-semibold text-sm">Growth Potential</span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      {monthlyEarnings < 1000 
                        ? "Increase project value or deals to reach £1,000+/month"
                        : "You're on track for excellent earnings! Consider scaling up."
                      }
                    </p>
                  </CardContent>
                </Card>

                {/* CTA Button */}
                <Button 
                  onClick={handleApplyNow}
                  size="lg"
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 text-lg min-h-[48px] touch-manipulation"
                >
                  Start Earning £{monthlyEarnings}/month
                  <Target className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
});

CommissionCalculator.displayName = 'CommissionCalculator';

export default CommissionCalculator; 