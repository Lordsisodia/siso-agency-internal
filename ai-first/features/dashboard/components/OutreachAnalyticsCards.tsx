
import { Card, CardContent } from '@/components/ui/card';
import { useLeadStats } from '@/hooks/useLeadStats';
import { Users, MessageSquare, Send, FileText, Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  percentage?: number;
  loading?: boolean;
}

const StatCard = ({ title, value, icon, description, percentage, loading }: StatCardProps) => {
  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-blue-900/10 to-blue-900/5">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-16" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="bg-gradient-to-br from-blue-900/10 to-blue-900/5 overflow-hidden relative hover:border-blue-500/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">{title}</p>
                  <p className="text-2xl font-bold mt-2">{value}</p>
                  {percentage && (
                    <div className="flex items-center mt-2">
                      <span className={`text-xs ${percentage > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {percentage > 0 ? '↑' : '↓'} {Math.abs(percentage)}%
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">vs last month</span>
                    </div>
                  )}
                </div>
                <div className="h-8 w-8 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                  {icon}
                </div>
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export function OutreachAnalyticsCards() {
  const { data: stats, isLoading } = useLeadStats();

  const cards = [
    {
      title: 'Total Leads',
      value: stats?.total || 0,
      icon: <Users className="h-4 w-4 text-blue-500" />,
      description: 'Total number of leads in your database',
      percentage: 12
    },
    {
      title: 'Engaged Leads',
      value: stats?.engaged || 0,
      icon: <MessageSquare className="h-4 w-4 text-green-500" />,
      description: 'Leads that have interacted with your outreach',
      percentage: 8
    },
    {
      title: 'Outreached',
      value: stats?.outreached || 0,
      icon: <Send className="h-4 w-4 text-purple-500" />,
      description: 'Leads you have contacted',
      percentage: 5
    },
    {
      title: 'Plans Viewed',
      value: stats?.plansViewed || 0,
      icon: <FileText className="h-4 w-4 text-amber-500" />,
      description: 'Leads who have viewed app plans',
      percentage: 15
    },
    {
      title: 'Clients',
      value: stats?.converted || 0,
      icon: <Award className="h-4 w-4 text-rose-500" />,
      description: 'Leads converted to clients',
      percentage: 3
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <StatCard
          key={card.title}
          loading={isLoading}
          {...card}
        />
      ))}
    </div>
  );
}
