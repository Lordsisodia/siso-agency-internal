
import { Card } from "@/components/ui/card";
import { Activity, User, FileText, DollarSign, CheckCircle, Award } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface ActivityItem {
  id: string | number;
  type: "client" | "project" | "invoice" | "payment" | "partner" | "achievement" | "conversion";
  title: string;
  description: string;
  timestamp: Date | string;
  user?: {
    name: string;
    avatar?: string;
  };
}

interface RecentActivityCardProps {
  activities: ActivityItem[];
  title?: string;
  viewAllLink?: string;
}

export function RecentActivityCard({ activities, title = "Recent Activity", viewAllLink = "/activity" }: RecentActivityCardProps) {
  const getActivityIcon = (type: string) => {
    switch(type) {
      case "client": return <User className="h-5 w-5 text-blue-400" />;
      case "project": return <CheckCircle className="h-5 w-5 text-green-400" />;
      case "invoice": return <FileText className="h-5 w-5 text-orange-400" />;
      case "payment": return <DollarSign className="h-5 w-5 text-emerald-400" />;
      case "partner": return <User className="h-5 w-5 text-cyan-400" />;
      case "achievement": return <Award className="h-5 w-5 text-yellow-400" />;
      case "conversion": return <CheckCircle className="h-5 w-5 text-purple-400" />;
      default: return <Activity className="h-5 w-5 text-siso-orange" />;
    }
  };

  const formatTimestamp = (timestamp: Date | string): string => {
    if (typeof timestamp === 'string') return timestamp;
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <Card className="bg-black/30 border border-siso-text/10 p-5 hover:border-siso-orange/30 transition-all duration-300">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-r from-siso-red/20 to-siso-orange/20">
            <Activity className="h-5 w-5 text-siso-orange" />
          </div>
        </div>

        <div className="space-y-4">
          {activities.slice(0, 4).map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4">
              <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-black/30 border border-siso-text/10">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex justify-between">
                  <h4 className="text-white font-medium truncate">{activity.title}</h4>
                  <span className="text-xs text-siso-text whitespace-nowrap">{formatTimestamp(activity.timestamp)}</span>
                </div>
                <p className="text-sm text-siso-text truncate">{activity.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-siso-text/10 text-center">
          <Link to={viewAllLink} className="text-sm text-siso-orange hover:text-white transition-colors">
            View All Activity
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}
