
import React from 'react';
import { ClientData } from '@/types/client.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageCircle, Phone, Calendar, FileText, Plus, Filter 
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface ClientInteractionLogProps {
  client: ClientData;
}

export function ClientInteractionLog({ client }: ClientInteractionLogProps) {
  // In a real implementation, these would be fetched from the database
  const interactions = [
    {
      id: 1,
      type: 'email',
      title: 'Project update',
      date: '2023-06-12T14:30:00Z',
      user: {
        name: 'Alex Johnson',
        avatar: null,
        role: 'Project Manager'
      },
      description: 'Sent weekly progress report and schedule update'
    },
    {
      id: 2,
      type: 'call',
      title: 'Requirements discussion',
      date: '2023-06-10T10:15:00Z',
      user: {
        name: 'Sarah Williams',
        avatar: null,
        role: 'Lead Developer'
      },
      description: 'Discussed technical requirements and API integration details'
    },
    {
      id: 3,
      type: 'meeting',
      title: 'Design review',
      date: '2023-06-08T15:00:00Z',
      user: {
        name: 'Michael Chen',
        avatar: null,
        role: 'UI/UX Designer'
      },
      description: 'Reviewed wireframes and collected feedback'
    },
    {
      id: 4,
      type: 'note',
      title: 'Client preference',
      date: '2023-06-05T11:45:00Z',
      user: {
        name: 'Alex Johnson',
        avatar: null,
        role: 'Project Manager'
      },
      description: 'Client expressed preference for darker color scheme'
    },
    {
      id: 5,
      type: 'email',
      title: 'Invoice sent',
      date: '2023-06-01T09:30:00Z',
      user: {
        name: 'Jessica Turner',
        avatar: null,
        role: 'Accounting'
      },
      description: 'Sent invoice #INV-2023-0042 for milestone payment'
    }
  ];

  const getInteractionIcon = (type: string) => {
    switch(type) {
      case 'email':
        return <MessageCircle className="h-4 w-4" />;
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'meeting':
        return <Calendar className="h-4 w-4" />;
      case 'note':
        return <FileText className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getInteractionColor = (type: string) => {
    switch(type) {
      case 'email':
        return 'bg-blue-100 text-blue-700';
      case 'call':
        return 'bg-green-100 text-green-700';
      case 'meeting':
        return 'bg-purple-100 text-purple-700';
      case 'note':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Interaction History</CardTitle>
            <CardDescription>
              Communication and interaction history with {client.full_name || client.business_name}
            </CardDescription>
          </div>
          <Button size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Interaction
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <Select defaultValue="all">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="note">Note</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        <div className="space-y-4">
          {interactions.map((interaction) => (
            <div key={interaction.id} className="border rounded-md p-4">
              <div className="flex items-start gap-3">
                <div className={`rounded-full p-2 ${getInteractionColor(interaction.type)}`}>
                  {getInteractionIcon(interaction.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{interaction.title}</h4>
                    <span className="text-xs text-muted-foreground">
                      {new Date(interaction.date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-sm my-1">{interaction.description}</p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={interaction.user.avatar || undefined} />
                      <AvatarFallback className="text-xs">
                        {interaction.user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-xs">
                      <span className="font-medium">{interaction.user.name}</span>
                      <span className="text-muted-foreground"> - {interaction.user.role}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        <Button variant="link" size="sm">
          Load More Interactions
        </Button>
      </CardFooter>
    </Card>
  );
}
