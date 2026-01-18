import React from "react";
import { Users, PoundSterling } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardStatsProps {
  totalClients: number;
  totalProjectValue: number;
}

export function DashboardStats({ totalClients, totalProjectValue }: DashboardStatsProps) {
  // Debug log to see what values we're getting
  console.log('DashboardStats received:', { totalClients, totalProjectValue });

  const stats = [
    {
      label: "Total Clients",
      value: totalClients,
      icon: Users,
      iconColor: "text-blue-400",
      bgColor: "bg-blue-500/20",
      borderColor: "border-blue-500/30",
    },
    {
      label: "Total Project Value",
      value: totalProjectValue > 0 
        ? totalProjectValue.toLocaleString("en-GB", { style: "currency", currency: "GBP" })
        : "£0.00",
      icon: PoundSterling,
      iconColor: "text-green-400", 
      bgColor: "bg-green-500/20",
      borderColor: "border-green-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {stats.map((stat) => (
        <Card key={stat.label} className={cn(
          "bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-gray-700 transition-all duration-200",
          stat.borderColor
        )}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-400 mb-1">{stat.label}</p>
                <p className="text-2xl font-semibold text-white">{stat.value}</p>
              </div>
              <div className={cn(
                "p-3 rounded-lg border",
                stat.bgColor,
                stat.borderColor
              )}>
                <stat.icon className={cn("w-6 h-6", stat.iconColor)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
