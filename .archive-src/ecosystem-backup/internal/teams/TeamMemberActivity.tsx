
import React from 'react';
import { 
  FileText, MessageCircle, CheckCircle, Clock, 
  File, User, PenTool, Database, Settings
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'task' | 'message' | 'document' | 'project' | 'system' | 'login';
  description: string;
  timestamp: string;
}

interface TeamMemberActivityProps {
  memberId: string;
}

export function TeamMemberActivity({ memberId }: TeamMemberActivityProps) {
  // In a real app, you'd fetch activity for the specific member
  const mockActivities: Activity[] = [
    {
      id: '1',
      type: 'task',
      description: 'Completed "Design new logo concepts" task',
      timestamp: '2025-06-10T14:32:00'
    },
    {
      id: '2',
      type: 'message',
      description: 'Sent message to Sarah regarding client feedback',
      timestamp: '2025-06-10T11:15:00'
    },
    {
      id: '3',
      type: 'document',
      description: 'Uploaded "Q2 Marketing Strategy.pdf"',
      timestamp: '2025-06-09T16:45:00'
    },
    {
      id: '4',
      type: 'project',
      description: 'Joined the "Website Redesign" project',
      timestamp: '2025-06-08T09:20:00'
    },
    {
      id: '5',
      type: 'login',
      description: 'Logged in from new device',
      timestamp: '2025-06-08T08:30:00'
    },
    {
      id: '6',
      type: 'system',
      description: 'Updated profile information',
      timestamp: '2025-06-07T13:10:00'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'message':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'document':
        return <FileText className="h-4 w-4 text-amber-500" />;
      case 'project':
        return <PenTool className="h-4 w-4 text-purple-500" />;
      case 'system':
        return <Settings className="h-4 w-4 text-gray-500" />;
      case 'login':
        return <User className="h-4 w-4 text-indigo-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const differenceInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (differenceInHours < 24) {
      return new Intl.DateTimeFormat('en-US', { 
        hour: 'numeric', 
        minute: 'numeric' 
      }).format(date);
    } else {
      return new Intl.DateTimeFormat('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      }).format(date);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">
        Recent Activity
      </div>
      
      <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-[11px] before:w-[1px] before:bg-border">
        {mockActivities.map(activity => (
          <div key={activity.id} className="flex gap-3 pl-7 relative">
            <div className="absolute left-0 top-0 rounded-full p-1 bg-background">
              {getActivityIcon(activity.type)}
            </div>
            
            <div className="flex-1 space-y-1">
              <p className="text-sm">{activity.description}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(activity.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {mockActivities.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No recent activity
        </div>
      )}
    </div>
  );
}
