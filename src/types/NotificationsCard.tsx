import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Calendar, FileText, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Sample notifications - in a real app, these would come from an API
const notifications = [
  {
    id: 1,
    title: "Task deadline approaching",
    description: "Smart contract audit due in 2 days",
    type: "deadline",
    time: "2 days",
    read: false
  },
  {
    id: 2,
    title: "Document shared with you",
    description: "Project scope document updated",
    type: "document",
    time: "4 hours ago",
    read: false
  },
  {
    id: 3,
    title: "Team meeting scheduled",
    description: "Weekly standup at 9:30 AM",
    type: "meeting",
    time: "Tomorrow",
    read: true
  }
];

export function NotificationsCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card className="border-siso-border bg-black/30 hover:border-siso-orange/30 transition-all duration-300 h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
            <Bell className="h-5 w-5 text-siso-orange" />
            Recent Notifications
            <Badge 
              variant="destructive" 
              className="ml-2 bg-siso-red/90 hover:bg-siso-red"
            >
              {notifications.filter(n => !n.read).length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 space-y-4">
          {Object.entries(
            notifications.reduce((acc, notification) => {
              const type = notification.type;
              if (!acc[type]) acc[type] = [];
              acc[type].push(notification);
              return acc;
            }, {} as Record<string, typeof notifications>)
          ).map(([type, groupNotifications]) => (
            <div key={type} className="space-y-2">
              <h4 className="text-sm font-medium text-siso-text capitalize mb-2">
                {type}
              </h4>
              {groupNotifications.map(notification => (
                <motion.div 
                  key={notification.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-3 rounded-lg flex gap-3 items-start ${
                    notification.read 
                      ? 'bg-black/20' 
                      : 'bg-gradient-to-r from-siso-orange/10 to-black/20 border-l-2 border-siso-orange'
                  }`}
                >
                  <div className="rounded-full p-2.5 bg-black/30 text-siso-orange">
                    {notification.type === 'deadline' && <Calendar className="h-4 w-4" />}
                    {notification.type === 'document' && <FileText className="h-4 w-4" />}
                    {notification.type === 'meeting' && <MessageSquare className="h-4 w-4" />}
                  </div>
                  <div className="flex-grow">
                    <div className="text-sm font-medium text-white flex justify-between">
                      <span>{notification.title}</span>
                      <span className="text-xs text-siso-text">{notification.time}</span>
                    </div>
                    <div className="text-xs text-siso-text mt-1">{notification.description}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
