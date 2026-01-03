
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ListTodo, Plus, Search, Filter, Calendar,
  CheckCircle2, Circle, Clock, Ban,
  AlertCircle, ArrowDownUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed' | 'blocked';
  priority: 'high' | 'medium' | 'low';
  assignee: {
    id: string;
    name: string;
    avatar: string;
  };
  dueDate: string;
  createdAt: string;
}

export function TeamTasksSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState('all');

  // In a real app, you'd fetch these tasks from your database
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Complete team dashboard implementation',
      description: 'Finish the UI components for the team management dashboard',
      status: 'in-progress',
      priority: 'high',
      assignee: {
        id: '1',
        name: 'Alex Johnson',
        avatar: ''
      },
      dueDate: '2025-06-20',
      createdAt: '2025-06-05'
    },
    {
      id: '2',
      title: 'Review marketing materials',
      description: 'Review the latest brochures and website copy',
      status: 'completed',
      priority: 'medium',
      assignee: {
        id: '4',
        name: 'Morgan Lee',
        avatar: ''
      },
      dueDate: '2025-06-10',
      createdAt: '2025-06-01'
    },
    {
      id: '3',
      title: 'Update API documentation',
      description: 'Ensure all endpoints are properly documented with examples',
      status: 'todo',
      priority: 'low',
      assignee: {
        id: '2',
        name: 'Sam Rodriguez',
        avatar: ''
      },
      dueDate: '2025-06-25',
      createdAt: '2025-06-07'
    },
    {
      id: '4',
      title: 'Fix authentication bug',
      description: 'Solve the issue with user authentication on mobile devices',
      status: 'blocked',
      priority: 'high',
      assignee: {
        id: '2',
        name: 'Sam Rodriguez',
        avatar: ''
      },
      dueDate: '2025-06-15',
      createdAt: '2025-06-03'
    },
    {
      id: '5',
      title: 'Create new UI mockups',
      description: 'Design mockups for the upcoming feature release',
      status: 'in-progress',
      priority: 'medium',
      assignee: {
        id: '3',
        name: 'Jamie Taylor',
        avatar: ''
      },
      dueDate: '2025-06-22',
      createdAt: '2025-06-06'
    },
  ];
  
  // Filter tasks based on search, status and current tab
  const filteredTasks = mockTasks.filter(task => {
    // Search filter
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignee.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = !statusFilter || task.status === statusFilter;
    
    // Tab filter
    const matchesTab = 
      currentTab === 'all' || 
      (currentTab === 'upcoming' && new Date(task.dueDate) > new Date()) ||
      (currentTab === 'overdue' && new Date(task.dueDate) < new Date());
    
    return matchesSearch && matchesStatus && matchesTab;
  });
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'blocked':
        return <Ban className="h-4 w-4 text-red-500" />;
      case 'todo':
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="default">Medium</Badge>;
      case 'low':
      default:
        return <Badge variant="outline">Low</Badge>;
    }
  };
  
  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return <span className="text-destructive">{Math.abs(diffDays)} days overdue</span>;
    } else if (diffDays === 0) {
      return <span className="text-amber-500">Due today</span>;
    } else if (diffDays === 1) {
      return <span className="text-amber-500">Due tomorrow</span>;
    } else {
      return <span>{diffDays} days remaining</span>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                <Filter className="h-4 w-4" /> 
                <span className="hidden sm:inline">Filter</span>
                {statusFilter && <Badge variant="secondary" className="ml-1">{statusFilter}</Badge>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                All Statuses
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('todo')}>
                <Circle className="h-4 w-4 text-gray-400 mr-2" /> Todo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('in-progress')}>
                <Clock className="h-4 w-4 text-blue-500 mr-2" /> In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('completed')}>
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" /> Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('blocked')}>
                <AlertCircle className="h-4 w-4 text-red-500 mr-2" /> Blocked
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <Button className="whitespace-nowrap">
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>
      
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <ListTodo className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No tasks found</p>
              <Button variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add a task
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map(task => (
            <Card key={task.id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 pt-1">
                    {getStatusIcon(task.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <h3 className="font-medium">{task.title}</h3>
                      {getPriorityBadge(task.priority)}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {task.description}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                          {task.assignee.name.charAt(0)}
                        </div>
                        <span className="text-sm">{task.assignee.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs">
                          Due {new Date(task.dueDate).toLocaleDateString()} ({getDaysRemaining(task.dueDate)})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
