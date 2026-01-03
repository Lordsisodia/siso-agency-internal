
import { Card } from "@/components/ui/card";
import { Users, UserPlus, UserMinus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { formatNumber } from "@/lib/formatters";
import { useNavigate } from "react-router-dom";

export function ClientsOverviewCard() {
  const navigate = useNavigate();
  
  // Updated client data to reflect our 9 active clients
  const clientData = {
    activeClients: 9,
    newClientsThisMonth: 2,
    retentionRate: 95,
    targetClients: 15,
  };
  
  const clientsProgress = (clientData.activeClients / clientData.targetClients) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="bg-black/30 border border-siso-text/10 p-5 hover:border-siso-orange/30 transition-all duration-300 cursor-pointer"
        onClick={() => navigate('/admin/clients')}
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold text-white">Client Overview</h3>
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-r from-siso-red/20 to-siso-orange/20">
            <Users className="h-5 w-5 text-siso-orange" />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-siso-text">Active Clients</span>
            <div className="flex items-center">
              <span className="text-white text-lg font-semibold">{formatNumber(clientData.activeClients)}</span>
              <span className="text-siso-text text-sm ml-1">/ {clientData.targetClients}</span>
            </div>
          </div>
          
          <Progress 
            value={clientsProgress} 
            className="h-2 bg-siso-text/20" 
            indicatorClassName="bg-gradient-to-r from-siso-red to-siso-orange"
          />
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center">
              <div className="h-8 w-8 mr-3 rounded-full flex items-center justify-center bg-green-500/20">
                <UserPlus className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <div className="text-sm text-siso-text">New Clients</div>
                <div className="text-white font-semibold">+{clientData.newClientsThisMonth}</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="h-8 w-8 mr-3 rounded-full flex items-center justify-center bg-blue-500/20">
                <UserMinus className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <div className="text-sm text-siso-text">Retention Rate</div>
                <div className="text-white font-semibold">{clientData.retentionRate}%</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
