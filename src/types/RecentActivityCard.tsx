
import { Card } from "@/components/ui/card";
import { Activity, User, FileText, DollarSign, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface ActivityItem {
  id: number;
  type: "client" | "project" | "invoice" | "payment";
  title: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

export function RecentActivityCard() {
  // This would be replaced with real data from your backend
  const activities: ActivityItem[] = [
    {
      id: 1,
      type: "client",
      title: "New Client Added",
      description: "John Smith was added as a new client",
      timestamp: "2 hours ago",
      user: {
        name: "You",
      }
    },
    {
      id: 2,
      type: "project",
      title: "Project Completed",
      description: "Portfolio Website project was marked as completed",
      timestamp: "Yesterday",
      user: {
        name: "You",
      }
    },
    {
      id: 3,
      type: "invoice",
      title: "Invoice Sent",
      description: "Invoice #1042 was sent to ABC Company",
      timestamp: "2 days ago",
      user: {
        name: "You",
      }
    },
    {
      id: 4,
      type: "payment",
      title: "Payment Received",
      description: "$2,500 payment received for Invoice #1039",
      timestamp: "3 days ago",
      user: {
        name: "You",
      }
    },
  ];

  const getActivityIcon = (type: string) => {
    switch(type) {
      case "client": return <User className="h-5 w-5 text-blue-400" />;
      case "project": return <CheckCircle className="h-5 w-5 text-green-400" />;
      case "invoice": return <FileText className="h-5 w-5 text-orange-400" />;
      case "payment": return <DollarSign className="h-5 w-5 text-emerald-400" />;
      default: return <Activity className="h-5 w-5 text-siso-orange" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <Card className="bg-black/30 border border-siso-text/10 p-5 hover:border-siso-orange/30 transition-all duration-300">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-r from-siso-red/20 to-siso-orange/20">
            <Activity className="h-5 w-5 text-siso-orange" />
          </div>
        </div>
        
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4">
              <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-black/30 border border-siso-text/10">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex justify-between">
                  <h4 className="text-white font-medium truncate">{activity.title}</h4>
                  <span className="text-xs text-siso-text whitespace-nowrap">{activity.timestamp}</span>
                </div>
                <p className="text-sm text-siso-text truncate">{activity.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t border-siso-text/10 text-center">
          <Link to="/activity" className="text-sm text-siso-orange hover:text-white transition-colors">
            View All Activity
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}
