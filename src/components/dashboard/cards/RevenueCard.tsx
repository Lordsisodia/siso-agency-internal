
import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/formatters";
import { useNavigate } from "react-router-dom";

export function RevenueCard() {
  const navigate = useNavigate();
  
  // These would be replaced with actual data from your backend
  const revenueData = {
    monthlyRevenue: 12450,
    percentageChange: 8.2,
    projectedRevenue: 15000,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card className="bg-black/30 border border-siso-text/10 p-5 hover:border-siso-orange/30 transition-all duration-300 cursor-pointer"
        onClick={() => navigate('/payments')}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Revenue</h3>
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-r from-siso-red/20 to-siso-orange/20">
            <DollarSign className="h-5 w-5 text-siso-orange" />
          </div>
        </div>
        
        <div className="mb-4">
          <div className="text-3xl font-bold text-white">{formatCurrency(revenueData.monthlyRevenue)}</div>
          <div className="flex items-center text-sm">
            <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
            <span className="text-green-500 font-medium">{revenueData.percentageChange}%</span>
            <span className="text-siso-text ml-1">vs last month</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-siso-red/10 to-siso-orange/10 p-3 rounded-lg">
          <div className="text-sm text-siso-text">Projected this month</div>
          <div className="text-lg font-semibold text-white">{formatCurrency(revenueData.projectedRevenue)}</div>
        </div>
      </Card>
    </motion.div>
  );
}
