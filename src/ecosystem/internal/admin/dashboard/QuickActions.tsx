
import React from 'react';
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Plus, Users, FileText, Calendar, Settings, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const QuickActions = React.memo(function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      title: "New Client",
      icon: Users,
      href: "/admin/clients/new",
      variant: "default" as const,
      color: "from-orange-500/20 to-orange-600/20"
    },
    {
      title: "Create Invoice",
      icon: FileText,
      href: "/admin/invoices/new",
      variant: "outline" as const,
      color: "from-orange-400/20 to-orange-500/20"
    },
    {
      title: "Schedule Meeting",
      icon: Calendar,
      href: "/admin/calendar",
      variant: "outline" as const,
      color: "from-orange-500/20 to-orange-600/20"
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/admin/settings",
      variant: "outline" as const,
      color: "from-orange-600/20 to-orange-700/20"
    }
  ];

  const handleActionClick = (action: any) => {
    if (action.href) {
      navigate(action.href);
    }
  };

  return (
    <Card className="border-orange-500/20 bg-black backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {actions.map((action, index) => (
          <div
            key={action.title}
            className="transform hover:scale-[1.02] transition-transform duration-200"
          >
            <Button
              variant={action.variant}
              onClick={() => handleActionClick(action)}
              className={`w-full justify-start bg-gradient-to-br ${action.color} text-white hover:shadow-lg transition-all duration-300`}
            >
              <action.icon className="mr-2 h-4 w-4" />
              {action.title}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
});
