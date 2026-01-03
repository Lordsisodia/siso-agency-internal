import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FolderOpen, 
  MessageSquare, 
  Upload, 
  Download,
  Calendar,
  Receipt
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function QuickActionsGrid() {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'View Projects',
      description: 'Check project progress',
      icon: FolderOpen,
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => navigate('/projects')
    },
    {
      title: 'Contact Team',
      description: 'Send message to team',
      icon: MessageSquare,
      color: 'bg-green-600 hover:bg-green-700',
      onClick: () => navigate('/help')
    },
    {
      title: 'Upload Files',
      description: 'Share documents',
      icon: Upload,
      color: 'bg-orange-600 hover:bg-orange-700',
      onClick: () => navigate('/projects')
    },
    {
      title: 'View Invoices',
      description: 'Billing & payments',
      icon: Receipt,
      color: 'bg-purple-600 hover:bg-purple-700',
      onClick: () => navigate('/client-dashboard')
    }
  ];

  return (
    <Card className="bg-black/30 backdrop-blur-sm border border-white/10 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-orange-500" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              className={`${action.color} text-white h-20 flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:scale-105`}
            >
              <action.icon className="h-5 w-5" />
              <div className="text-center">
                <div className="text-sm font-medium">{action.title}</div>
                <div className="text-xs opacity-80">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
        
        <div className="pt-2 border-t border-white/10">
          <p className="text-xs text-gray-400 text-center">
            Common client actions for your projects
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 