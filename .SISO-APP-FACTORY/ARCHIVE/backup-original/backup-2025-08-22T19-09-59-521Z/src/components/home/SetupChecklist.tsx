
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Settings, CreditCard, Users, FileCheck, ShoppingCart, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: {
    text: string;
    path: string;
  };
  completed: boolean;
}

export const SetupChecklist = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: 'admin',
      title: 'Set up admin account',
      description: 'Create your administrator account to manage your OnlyFans agency platform',
      icon: <Settings className="h-6 w-6 text-white" />,
      action: {
        text: 'Setup Account',
        path: '/settings'
      },
      completed: false
    },
    {
      id: 'payment',
      title: 'Connect payment processor',
      description: 'Link your payment provider to start accepting payments from creators',
      icon: <CreditCard className="h-6 w-6 text-white" />,
      action: {
        text: 'Connect Payment',
        path: '/payments'
      },
      completed: false
    },
    {
      id: 'service',
      title: 'Define your services',
      description: 'Set up the services and packages you offer to OnlyFans creators',
      icon: <Users className="h-6 w-6 text-white" />,
      action: {
        text: 'Add Services',
        path: '/portfolio'
      },
      completed: false
    },
    {
      id: 'form',
      title: 'Create order form',
      description: 'Design a custom order form for creators to request your services',
      icon: <FileCheck className="h-6 w-6 text-white" />,
      action: {
        text: 'Create Form',
        path: '/plan-builder'
      },
      completed: false
    },
    {
      id: 'test',
      title: 'Test purchase flow',
      description: 'Make a test purchase to ensure your payment system works correctly',
      icon: <ShoppingCart className="h-6 w-6 text-white" />,
      action: {
        text: 'Test Purchase',
        path: '/my-projects'
      },
      completed: false
    },
    {
      id: 'launch',
      title: 'Go live with your agency',
      description: 'Launch your OnlyFans management platform and start accepting clients',
      icon: <Globe className="h-6 w-6 text-white" />,
      action: {
        text: 'Launch Agency',
        path: '/my-projects'
      },
      completed: false
    }
  ]);

  // Calculate completion percentage
  const completionPercentage = Math.round((items.filter(item => item.completed).length / items.length) * 100);
  
  // Load saved progress from localStorage on component mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('setupProgress');
    if (savedProgress) {
      try {
        const parsedProgress = JSON.parse(savedProgress);
        setItems(prev => 
          prev.map(item => ({
            ...item,
            completed: parsedProgress.includes(item.id)
          }))
        );
      } catch (error) {
        console.error('Error parsing saved progress:', error);
      }
    }
  }, []);

  // Toggle item completion status
  const toggleCompletion = (id: string) => {
    setItems(prev => {
      const updated = prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      );
      
      // Save completed items to localStorage
      const completedIds = updated.filter(item => item.completed).map(item => item.id);
      localStorage.setItem('setupProgress', JSON.stringify(completedIds));
      
      return updated;
    });

    // Show toast notification
    toast({
      title: "Progress updated",
      description: "Your setup progress has been saved",
    });
  };

  // Navigate to action path
  const handleAction = (path: string) => {
    navigate(path);
  };

  return (
    <div className="bg-black/30 border border-siso-text/10 rounded-lg p-6 hover:border-siso-orange/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Setup Checklist</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-siso-text">{completionPercentage}% Complete</span>
          <Progress 
            value={completionPercentage} 
            className="w-24 h-2 bg-siso-text/20" 
            indicatorClassName="bg-gradient-to-r from-siso-red to-siso-orange"
          />
        </div>
      </div>
      
      <div className="relative">
        {/* Vertical line connecting the steps */}
        <div className="absolute left-[23px] top-10 bottom-10 w-0.5 bg-gradient-to-b from-siso-red/70 to-siso-orange/70 z-0"></div>
        
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-start gap-4 relative z-10">
              {/* Icon with gradient background */}
              <div 
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full z-20
                  ${item.completed 
                    ? 'bg-gradient-to-r from-siso-red to-siso-orange' 
                    : 'bg-gradient-to-r from-siso-red/20 to-siso-orange/20 border border-siso-text/20'}`}
                onClick={() => toggleCompletion(item.id)}
              >
                {item.completed ? (
                  <Check className="h-6 w-6 text-white" />
                ) : (
                  item.icon
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-medium ${item.completed ? 'text-siso-orange line-through' : 'text-white'}`}>
                    {item.title}
                  </h3>
                  {item.completed && (
                    <span className="text-xs bg-siso-orange/20 text-siso-orange px-2 py-0.5 rounded">
                      Completed
                    </span>
                  )}
                </div>
                <p className="text-sm text-siso-text mb-2">
                  {item.description}
                </p>
                <Button
                  variant={item.completed ? "outline" : "default"}
                  size="sm"
                  className={item.completed
                    ? "border-siso-orange/30 text-siso-orange hover:bg-siso-orange/10"
                    : "bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90"}
                  onClick={() => handleAction(item.action.path)}
                >
                  {item.action.text}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
