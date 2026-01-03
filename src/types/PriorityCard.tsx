import React from 'react';
import { ClientData } from '@/types/client.types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Calendar, ArrowRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface PriorityCardProps {
  client: ClientData;
  onClick?: () => void;
}

export function PriorityCard({ client, onClick }: PriorityCardProps) {
  return (
    <Card 
      className="bg-gray-900/50 border border-orange-500/30 hover:border-orange-500/50 transition-all duration-200 cursor-pointer group backdrop-blur-sm"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-white group-hover:text-orange-300 transition-colors">
              {client.business_name || client.full_name}
            </h3>
            <p className="text-sm text-gray-400 mt-1">{client.project_name || 'No project name'}</p>
          </div>
          <Badge 
            variant="outline" 
            className="bg-orange-500/20 text-orange-300 border-orange-500/30 hover:bg-orange-500/30"
          >
            Priority
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="py-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">
              Updated {formatDistanceToNow(new Date(client.updated_at), { addSuffix: true })}
            </span>
          </div>
          
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-white">Requires immediate attention</p>
              <p className="text-sm text-gray-400 mt-1">
                {client.todos && client.todos.length > 0
                  ? `${client.todos.length} pending tasks`
                  : 'No pending tasks'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 pb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-auto text-orange-300 hover:text-orange-200 hover:bg-orange-500/20 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          View Details <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );
}
