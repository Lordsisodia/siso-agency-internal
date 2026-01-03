import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Filter, Plus, ChevronDown, MessageSquare, CheckCircle, X, AlertTriangle } from 'lucide-react';

interface FeedbackItem {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  date: string;
  author: {
    name: string;
    avatar: string;
  };
  screen?: string;
  comments?: number;
}

export function FeedbackLogPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sample feedback data
  const feedbackItems: FeedbackItem[] = [
    {
      id: 'fb-001',
      title: 'Navigation bar is not responsive on mobile',
      description: 'When viewing on iPhone 12, the navigation menu overlaps with the content.',
      status: 'open',
      priority: 'high',
      date: '2023-09-15',
      author: {
        name: 'Emma Watson',
        avatar: '/avatars/emma.jpg'
      },
      screen: 'Dashboard',
      comments: 3
    },
    {
      id: 'fb-002',
      title: 'Add dark mode toggle in settings',
      description: 'Users want the ability to switch between light and dark themes.',
      status: 'resolved',
      priority: 'medium',
      date: '2023-09-10',
      author: {
        name: 'John Smith',
        avatar: '/avatars/john.jpg'
      },
      screen: 'Settings',
      comments: 5
    },
    {
      id: 'fb-003',
      title: 'Payment form validation issues',
      description: 'Credit card validation is not working properly for American Express cards.',
      status: 'open',
      priority: 'high',
      date: '2023-09-18',
      author: {
        name: 'Alex Johnson',
        avatar: '/avatars/alex.jpg'
      },
      screen: 'Checkout',
      comments: 2
    },
    {
      id: 'fb-004',
      title: 'Loading time too long for image gallery',
      description: 'The image gallery takes more than 5 seconds to load on average connections.',
      status: 'open',
      priority: 'medium',
      date: '2023-09-12',
      author: {
        name: 'Sarah Parker',
        avatar: '/avatars/sarah.jpg'
      },
      screen: 'Gallery',
      comments: 1
    },
    {
      id: 'fb-005',
      title: 'Font size too small in article pages',
      description: 'Many users have reported difficulty reading the content due to small font size.',
      status: 'rejected',
      priority: 'low',
      date: '2023-09-08',
      author: {
        name: 'Mike Brown',
        avatar: '/avatars/mike.jpg'
      },
      screen: 'Blog',
      comments: 4
    }
  ];

  // Filter feedback based on active tab and search query
  const filteredFeedback = feedbackItems.filter(item => {
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'open' && item.status === 'open') ||
      (activeTab === 'resolved' && item.status === 'resolved') ||
      (activeTab === 'rejected' && item.status === 'rejected');
    
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.screen?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <div className="p-2 rounded-full bg-amber-500/10 border border-amber-500/30">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
        );
      case 'resolved':
        return (
          <div className="p-2 rounded-full bg-green-500/10 border border-green-500/30">
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
        );
      case 'rejected':
        return (
          <div className="p-2 rounded-full bg-red-500/10 border border-red-500/30">
            <X className="h-4 w-4 text-red-500" />
          </div>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-500/80 hover:bg-red-500 text-white font-medium px-3">High</Badge>;
      case 'medium':
        return <Badge className="bg-amber-500/80 hover:bg-amber-500 text-white font-medium px-3">Medium</Badge>;
      case 'low':
        return <Badge className="bg-blue-500/80 hover:bg-blue-500 text-white font-medium px-3">Low</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Feedback Log</h1>
          <p className="text-gray-300 mt-1">Track and manage feedback from stakeholders</p>
        </div>
        <Button className="mt-4 sm:mt-0 bg-siso-orange hover:bg-siso-orange/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Feedback
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search feedback..."
            className="pl-10 bg-black/30 border-gray-700 focus:border-siso-orange/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 border-gray-700 hover:border-siso-orange/50 hover:bg-black/40">
            <Filter className="h-4 w-4" />
            Filter
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="bg-black/30 backdrop-blur-sm border border-gray-700 shadow-lg">
        <CardHeader className="border-b border-gray-700/50 pb-4">
          <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full sm:w-auto bg-black/40 border border-gray-700/50">
              <TabsTrigger value="all" className="data-[state=active]:bg-siso-orange/80">All Feedback</TabsTrigger>
              <TabsTrigger value="open" className="data-[state=active]:bg-siso-orange/80">Open</TabsTrigger>
              <TabsTrigger value="resolved" className="data-[state=active]:bg-siso-orange/80">Resolved</TabsTrigger>
              <TabsTrigger value="rejected" className="data-[state=active]:bg-siso-orange/80">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="pt-6">
          {filteredFeedback.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 mx-auto text-gray-500 opacity-20" />
              <p className="mt-4 text-gray-400">No feedback entries found</p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredFeedback.map((item) => (
                <div 
                  key={item.id} 
                  className="p-5 border border-gray-700/50 rounded-lg bg-black/40 hover:bg-black/60 hover:border-siso-orange/30 transition-all duration-300 cursor-pointer shadow-md"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-start gap-4">
                      {getStatusIcon(item.status)}
                      <div>
                        <h3 className="font-semibold text-lg text-white">{item.title}</h3>
                        <p className="text-gray-300 mt-2">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <div>
                      {getPriorityBadge(item.priority)}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap sm:flex-nowrap justify-between mt-5 pt-4 border-t border-gray-700/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-siso-orange text-sm flex items-center justify-center font-medium text-white">
                        {item.author.name.charAt(0)}
                      </div>
                      <span className="text-sm text-gray-300">
                        {item.author.name} • {formatDate(item.date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-3 sm:mt-0">
                      {item.screen && (
                        <Badge variant="outline" className="text-sm border-gray-600 bg-black/40 text-gray-200 px-2.5 py-1">
                          {item.screen}
                        </Badge>
                      )}
                      {item.comments && item.comments > 0 && (
                        <div className="flex items-center text-sm text-gray-300 bg-black/40 px-2.5 py-1 rounded-md border border-gray-600">
                          <MessageSquare className="h-4 w-4 mr-1.5" />
                          {item.comments}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 