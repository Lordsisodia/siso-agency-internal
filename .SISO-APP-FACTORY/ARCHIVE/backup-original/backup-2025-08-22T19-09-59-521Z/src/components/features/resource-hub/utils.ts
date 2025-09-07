
import { CardStats } from './types';

export const getCardStyles = (type: string) => {
  switch (type) {
    case "ai-tools":
      return "bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/20 hover:border-purple-500/40";
    case "education":
      return "bg-gradient-to-br from-green-900/30 to-blue-900/30 border-green-500/20 hover:border-green-500/40";
    case "community":
      return "bg-gradient-to-br from-orange-900/30 to-red-900/30 border-orange-500/20 hover:border-orange-500/40";
    case "economy":
      return "bg-gradient-to-br from-emerald-900/30 to-yellow-900/30 border-emerald-500/20 hover:border-emerald-500/40";
    case "news":
      return "bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/20 hover:border-blue-500/40";
    default:
      return "bg-black/90";
  }
};

export const getCardStats = (type: string): CardStats | null => {
  switch (type) {
    case "ai-tools":
      return {
        mainStat: "24/7",
        mainLabel: "AI Availability",
        secondaryStat: "95%",
        secondaryLabel: "Accuracy Rate",
        benefits: ["Custom Recommendations", "Real-time Analysis", "Data-driven Insights"]
      };
    case "education":
      return {
        mainStat: "1000+",
        mainLabel: "Video Resources",
        secondaryStat: "10x",
        secondaryLabel: "Learning Speed",
        benefits: ["AI-Powered Summaries", "Interactive Learning", "Progress Tracking"]
      };
    case "community":
      return {
        mainStat: "1M+",
        mainLabel: "Members",
        secondaryStat: "50k+",
        secondaryLabel: "Active Daily",
        benefits: ["Global Network", "Niche Groups", "Expert Connections"]
      };
    case "economy":
      return {
        mainStat: "$10M+",
        mainLabel: "Total Value",
        secondaryStat: "100k+",
        secondaryLabel: "Token Holders",
        benefits: ["Tokenized Rewards", "Premium Features", "Economic Benefits"]
      };
    case "news":
      return {
        mainStat: "24/7",
        mainLabel: "Updates",
        secondaryStat: "1hr",
        secondaryLabel: "Avg. Response",
        benefits: ["Real-time Updates", "Curated Content", "Industry Analysis"]
      };
    default:
      return null;
  }
};
