
import { Card } from "@/components/ui/card";
import { Users, CreditCard, ChartLine } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  className?: string;
}

function StatCard({ title, value, change, isPositive, icon, className = "" }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`bg-black/30 border border-siso-text/10 p-5 hover:border-siso-orange/30 transition-all duration-300 ${className}`}>
        <div className="flex justify-between">
          <div>
            <p className="text-siso-text text-sm">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
          </div>
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-r from-siso-red/20 to-siso-orange/20">
            {icon}
          </div>
        </div>
        <div className="flex items-center mt-3">
          <span className={`text-xs font-medium ${isPositive ? 'text-green-500' : 'text-red-500'} flex items-center`}>
            {isPositive ? '↑' : '↓'} {change}
          </span>
          <span className="text-xs text-siso-text ml-2">vs last month</span>
        </div>
      </Card>
    </motion.div>
  );
}

export function DashboardStats() {
  return (
    <div className="flex flex-col space-y-4">
      <StatCard 
        title="Active Clients" 
        value="24" 
        change="12%" 
        isPositive={true}
        icon={<Users className="h-5 w-5 text-siso-orange" />}
      />
      <StatCard 
        title="Revenue" 
        value="$12,450" 
        change="8%" 
        isPositive={true}
        icon={<CreditCard className="h-5 w-5 text-siso-orange" />}
      />
      <StatCard 
        title="Conversion Rate" 
        value="64%" 
        change="5%" 
        isPositive={false}
        icon={<ChartLine className="h-5 w-5 text-siso-orange" />}
      />
    </div>
  );
}
