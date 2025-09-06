import { useState, useEffect } from 'react';
import { feedbackService } from '@/services/feedbackService';
import { 
  UserFeedback, 
  FeedbackStatus, 
  FEEDBACK_CATEGORIES, 
  FEEDBACK_PRIORITIES, 
  FEEDBACK_TYPES 
} from '@/types/feedback';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState<UserFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<UserFeedback | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadFeedback();
    loadStats();
  }, []);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const data = await feedbackService.getAllFeedback({ limit: 100 });
      setFeedback(data);
    } catch (error) {
      console.error('Failed to load feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await feedbackService.getFeedbackStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const updateFeedbackStatus = async (id: string, status: FeedbackStatus, response?: string) => {
    try {
      await feedbackService.updateFeedbackStatus(id, status, response);
      await loadFeedback();
      setSelectedFeedback(null);
      setAdminResponse('');
    } catch (error) {
      console.error('Failed to update feedback:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-500';
      case 'REVIEWING': return 'bg-yellow-500';
      case 'IN_PROGRESS': return 'bg-orange-500';
      case 'RESOLVED': return 'bg-green-500';
      case 'CLOSED': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = FEEDBACK_CATEGORIES.find(c => c.value === category);
    return cat?.label || category;
  };

  const getTypeEmoji = (type: string) => {
    const typeObj = FEEDBACK_TYPES.find(t => t.value === type);
    return typeObj?.emoji || '💭';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading feedback...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Feedback Management</h1>
        <Button onClick={loadFeedback}>Refresh</Button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFeedback}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Open/Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.openFeedback}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.resolvedFeedback}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalFeedback > 0 
                  ? Math.round((stats.resolvedFeedback / stats.totalFeedback) * 100)
                  : 0}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Feedback</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="reviewing">Reviewing</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <FeedbackTable 
            feedback={feedback} 
            onSelect={setSelectedFeedback}
            onStatusUpdate={updateFeedbackStatus}
          />
        </TabsContent>

        <TabsContent value="open" className="space-y-4">
          <FeedbackTable 
            feedback={feedback.filter(f => f.status === 'OPEN')} 
            onSelect={setSelectedFeedback}
            onStatusUpdate={updateFeedbackStatus}
          />
        </TabsContent>

        <TabsContent value="reviewing" className="space-y-4">
          <FeedbackTable 
            feedback={feedback.filter(f => f.status === 'REVIEWING' || f.status === 'IN_PROGRESS')} 
            onSelect={setSelectedFeedback}
            onStatusUpdate={updateFeedbackStatus}
          />
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          <FeedbackTable 
            feedback={feedback.filter(f => f.status === 'RESOLVED' || f.status === 'CLOSED')} 
            onSelect={setSelectedFeedback}
            onStatusUpdate={updateFeedbackStatus}
          />
        </TabsContent>
      </Tabs>

      {/* Feedback Detail Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold">{selectedFeedback.title}</h2>
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedFeedback(null)}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <Badge className={getPriorityColor(selectedFeedback.priority)}>
                    {selectedFeedback.priority}
                  </Badge>
                  <Badge className={getStatusColor(selectedFeedback.status)}>
                    {selectedFeedback.status}
                  </Badge>
                  <Badge variant="outline">
                    {getTypeEmoji(selectedFeedback.feedbackType)} {selectedFeedback.feedbackType}
                  </Badge>
                  <Badge variant="outline">
                    {getCategoryIcon(selectedFeedback.category)}
                  </Badge>
                </div>

                <div>
                  <strong>Description:</strong>
                  <p className="mt-1 p-3 bg-gray-100 dark:bg-gray-700 rounded">
                    {selectedFeedback.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Page:</strong> {selectedFeedback.page || 'N/A'}</div>
                  <div><strong>Created:</strong> {format(new Date(selectedFeedback.createdAt), 'PPp')}</div>
                  <div><strong>Browser:</strong> {selectedFeedback.browserInfo || 'N/A'}</div>
                  <div><strong>Device:</strong> {selectedFeedback.deviceInfo || 'N/A'}</div>
                </div>

                {selectedFeedback.adminResponse && (
                  <div>
                    <strong>Admin Response:</strong>
                    <p className="mt-1 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                      {selectedFeedback.adminResponse}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <Textarea
                    placeholder="Add admin response..."
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    rows={3}
                  />

                  <div className="flex gap-2">
                    <Select 
                      onValueChange={(status: FeedbackStatus) => 
                        updateFeedbackStatus(selectedFeedback.id, status, adminResponse || undefined)
                      }
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="REVIEWING">Mark as Reviewing</SelectItem>
                        <SelectItem value="IN_PROGRESS">Mark as In Progress</SelectItem>
                        <SelectItem value="RESOLVED">Mark as Resolved</SelectItem>
                        <SelectItem value="CLOSED">Close</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FeedbackTable = ({ 
  feedback, 
  onSelect, 
  onStatusUpdate 
}: { 
  feedback: UserFeedback[]; 
  onSelect: (feedback: UserFeedback) => void;
  onStatusUpdate: (id: string, status: FeedbackStatus) => void;
}) => {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {feedback.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.title}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {FEEDBACK_TYPES.find(t => t.value === item.feedbackType)?.emoji} {item.feedbackType}
                </Badge>
              </TableCell>
              <TableCell>
                {FEEDBACK_CATEGORIES.find(c => c.value === item.category)?.label}
              </TableCell>
              <TableCell>
                <Badge className={getPriorityColor(item.priority)}>
                  {item.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(item.status)}>
                  {item.status}
                </Badge>
              </TableCell>
              <TableCell>{format(new Date(item.createdAt), 'MMM d, yyyy')}</TableCell>
              <TableCell>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onSelect(item)}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'URGENT': return 'bg-red-500';
    case 'HIGH': return 'bg-orange-500';
    case 'MEDIUM': return 'bg-yellow-500';
    case 'LOW': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'OPEN': return 'bg-blue-500';
    case 'REVIEWING': return 'bg-yellow-500';
    case 'IN_PROGRESS': return 'bg-orange-500';
    case 'RESOLVED': return 'bg-green-500';
    case 'CLOSED': return 'bg-gray-500';
    default: return 'bg-gray-500';
  }
};

export default AdminFeedback;