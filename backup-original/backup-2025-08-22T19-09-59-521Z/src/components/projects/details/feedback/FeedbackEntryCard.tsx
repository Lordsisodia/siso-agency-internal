import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Flag, CheckCircle, AlertCircle, Clock, ChevronRight, ChevronDown } from 'lucide-react';
import { FeedbackEntry } from './sampleFeedbackData';

interface FeedbackEntryCardProps {
  feedback: FeedbackEntry;
  onViewDetails?: (id: string) => void;
}

export function FeedbackEntryCard({ feedback, onViewDetails }: FeedbackEntryCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <Flag className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'In Progress';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-500 hover:bg-red-600">High</Badge>;
      case 'medium':
        return <Badge className="bg-amber-500 hover:bg-amber-600">Medium</Badge>;
      case 'low':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Low</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <Card className="border border-siso-text/10 bg-black/20 backdrop-blur-sm hover:bg-siso-text/5 transition-colors">
      <CardHeader className="p-4 pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-2">
            <div className="mt-1">
              {getStatusIcon(feedback.status)}
            </div>
            <div>
              <h3 className="font-medium">{feedback.title}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <span>#{feedback.id.split('-')[1]}</span>
                <span>•</span>
                <span>Created {formatDate(feedback.createdAt)}</span>
                {feedback.updatedAt && (
                  <>
                    <span>•</span>
                    <span>Updated {formatDate(feedback.updatedAt)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getStatusColor(feedback.status)}>
              {getStatusText(feedback.status)}
            </Badge>
            {getPriorityBadge(feedback.priority)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className={`text-sm text-muted-foreground ${expanded ? '' : 'line-clamp-2'}`}>
          {feedback.description}
        </p>
        
        {feedback.description.length > 150 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-1 p-0 h-auto text-xs text-muted-foreground hover:text-siso-text"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Show less' : 'Show more'} 
            {expanded ? <ChevronDown className="h-3 w-3 ml-1" /> : <ChevronRight className="h-3 w-3 ml-1" />}
          </Button>
        )}
        
        <div className="flex justify-between items-center mt-4 pt-2 border-t border-siso-text/5">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={feedback.authorAvatar} alt={feedback.authorName} />
              <AvatarFallback>{feedback.authorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{feedback.authorName}</span>
          </div>
          
          <div className="flex items-center gap-3">
            {feedback.screenName && (
              <Badge variant="outline" className="text-xs">
                {feedback.screenName}
              </Badge>
            )}
            
            {feedback.comments && feedback.comments.length > 0 && (
              <div className="flex items-center text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3 mr-1" />
                {feedback.comments.length}
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={() => onViewDetails && onViewDetails(feedback.id)}
            >
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 