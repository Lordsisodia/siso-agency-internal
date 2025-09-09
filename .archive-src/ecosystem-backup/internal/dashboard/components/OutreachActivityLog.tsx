
import React from 'react';
import { 
  MessageSquare,
  Heart,
  UserPlus,
  FileText,
  ClipboardCheck
} from 'lucide-react';

export function OutreachActivityLog() {
  // Mock data for recent activities
  const activities = [
    { 
      id: 1, 
      type: 'message', 
      username: 'fitness_coach1', 
      time: '10 minutes ago',
      message: 'Sent DM about app plan'
    },
    { 
      id: 2, 
      type: 'follow', 
      username: 'design_agency', 
      time: '25 minutes ago' 
    },
    { 
      id: 3, 
      type: 'like', 
      username: 'tech_startup', 
      time: '1 hour ago',
      postInfo: 'Latest product launch post'
    },
    { 
      id: 4, 
      type: 'plan', 
      username: 'saas_founder', 
      time: '3 hours ago',
      planName: 'SaaS Dashboard MVP'
    },
    { 
      id: 5, 
      type: 'qualified', 
      username: 'ecommerce_guru', 
      time: '5 hours ago' 
    }
  ];
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'follow':
        return <UserPlus className="h-4 w-4 text-purple-500" />;
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'plan':
        return <FileText className="h-4 w-4 text-amber-500" />;
      case 'qualified':
        return <ClipboardCheck className="h-4 w-4 text-green-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  const getActivityText = (activity: any) => {
    switch (activity.type) {
      case 'message':
        return (
          <span>
            Sent a DM to <strong>@{activity.username}</strong>
            {activity.message && <span className="text-xs text-muted-foreground block mt-0.5">{activity.message}</span>}
          </span>
        );
      case 'follow':
        return <span>Followed <strong>@{activity.username}</strong></span>;
      case 'like':
        return (
          <span>
            Liked a post from <strong>@{activity.username}</strong>
            {activity.postInfo && <span className="text-xs text-muted-foreground block mt-0.5">{activity.postInfo}</span>}
          </span>
        );
      case 'plan':
        return (
          <span>
            Created app plan for <strong>@{activity.username}</strong>
            {activity.planName && <span className="text-xs text-muted-foreground block mt-0.5">{activity.planName}</span>}
          </span>
        );
      case 'qualified':
        return <span>Qualified lead <strong>@{activity.username}</strong> as potential client</span>;
      default:
        return <span>Interacted with <strong>@{activity.username}</strong></span>;
    }
  };

  return (
    <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
      {activities.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          No recent activities
        </div>
      ) : (
        activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-muted last:border-0">
            <div className="mt-1">
              <div className="p-1.5 bg-muted rounded-full">
                {getActivityIcon(activity.type)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm">{getActivityText(activity)}</p>
              <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
