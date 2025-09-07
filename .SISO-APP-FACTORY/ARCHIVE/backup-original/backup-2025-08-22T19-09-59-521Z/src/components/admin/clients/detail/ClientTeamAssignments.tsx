
import React from 'react';
import { ClientData } from '@/types/client.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UserPlus, MessageCircle, Calendar, ClockIcon, MessageSquare
} from 'lucide-react';

interface ClientTeamAssignmentsProps {
  client: ClientData;
}

export function ClientTeamAssignments({ client }: ClientTeamAssignmentsProps) {
  // In a real implementation, these would be fetched from the database
  const teamMembers = [
    {
      id: 1,
      name: 'Alex Johnson',
      role: 'Project Manager',
      avatar: null,
      status: 'active',
      lastActive: '2023-06-14T14:30:00Z',
    },
    {
      id: 2,
      name: 'Sarah Williams',
      role: 'Lead Developer',
      avatar: null,
      status: 'active',
      lastActive: '2023-06-14T10:15:00Z',
    },
    {
      id: 3,
      name: 'Michael Chen',
      role: 'UI/UX Designer',
      avatar: null,
      status: 'away',
      lastActive: '2023-06-13T16:45:00Z',
    },
    {
      id: 4,
      name: 'Jessica Turner',
      role: 'Accounting',
      avatar: null,
      status: 'offline',
      lastActive: '2023-06-10T09:30:00Z',
    }
  ];

  const conversations = [
    {
      id: 1,
      title: 'Project Kickoff Discussion',
      participants: ['Alex Johnson', 'Sarah Williams', 'Michael Chen', client.full_name || 'Client'],
      lastMessage: 'Great meeting everyone! I\'ll send the summary shortly.',
      lastMessageTime: '2023-05-01T15:30:00Z',
      unread: 0,
    },
    {
      id: 2,
      title: 'Design Review',
      participants: ['Michael Chen', 'Alex Johnson', client.full_name || 'Client'],
      lastMessage: 'I\'ve uploaded the revised mockups for review.',
      lastMessageTime: '2023-05-15T11:20:00Z',
      unread: 2,
    },
    {
      id: 3,
      title: 'Technical Requirements',
      participants: ['Sarah Williams', 'Alex Johnson'],
      lastMessage: 'Let\'s schedule a call to discuss the API integration details.',
      lastMessageTime: '2023-06-05T09:45:00Z',
      unread: 0,
    }
  ];

  const meetings = [
    {
      id: 1,
      title: 'Weekly Progress Update',
      date: '2023-06-16T14:00:00Z',
      duration: 60,
      participants: ['Alex Johnson', 'Sarah Williams', client.full_name || 'Client'],
      location: 'Google Meet',
    },
    {
      id: 2,
      title: 'Design Review Session',
      date: '2023-06-19T10:30:00Z',
      duration: 90,
      participants: ['Alex Johnson', 'Michael Chen', client.full_name || 'Client'],
      location: 'Zoom',
    },
    {
      id: 3,
      title: 'Technical Implementation Planning',
      date: '2023-06-21T15:00:00Z',
      duration: 120,
      participants: ['Sarah Williams', 'David Kim', 'Alex Johnson'],
      location: 'Office Conference Room',
    }
  ];

  const getStatusIndicator = (status: string) => {
    switch(status) {
      case 'active':
        return <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>;
      case 'away':
        return <span className="absolute bottom-0 right-0 w-3 h-3 bg-yellow-500 border-2 border-white rounded-full"></span>;
      case 'offline':
        return <span className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 border-2 border-white rounded-full"></span>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + 
           date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMeetingTime = (dateString: string, duration: number) => {
    const date = new Date(dateString);
    const endDate = new Date(date.getTime() + duration * 60000);
    
    return date.toLocaleDateString() + ', ' +
           date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' +
           endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Team Members</CardTitle>
            <Button size="sm" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add Member
            </Button>
          </div>
          <CardDescription>
            Team members assigned to {client.project_name || 'this project'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="border rounded-lg p-4 flex flex-col items-center text-center">
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={member.avatar || undefined} />
                    <AvatarFallback className="text-lg bg-primary/20 text-primary">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {getStatusIndicator(member.status)}
                </div>
                
                <h4 className="font-medium mt-2">{member.name}</h4>
                <Badge variant="outline" className="mt-1">
                  {member.role}
                </Badge>
                
                <div className="flex justify-center gap-2 mt-4 w-full">
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Calendar className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
                  <ClockIcon className="h-3 w-3" />
                  Last active: {new Date(member.lastActive).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="conversations">
        <TabsList className="w-full">
          <TabsTrigger value="conversations" className="flex-1">Team Conversations</TabsTrigger>
          <TabsTrigger value="meetings" className="flex-1">Scheduled Meetings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="conversations">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {conversations.map((conversation) => (
                  <div key={conversation.id} className="p-4 hover:bg-muted/20">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{conversation.title}</h4>
                      <div className="flex items-center">
                        {conversation.unread > 0 && (
                          <Badge variant="destructive" className="rounded-full h-5 w-5 flex items-center justify-center p-0 mr-2">
                            {conversation.unread}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {new Date(conversation.lastMessageTime).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {conversation.lastMessage}
                    </p>
                    
                    <div className="flex flex-wrap gap-1">
                      {conversation.participants.map((participant, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {participant}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex justify-end mt-2">
                      <Button variant="ghost" size="sm" className="flex items-center gap-1 h-7">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Open</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="meetings">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {meetings.map((meeting) => (
                  <div key={meeting.id} className="p-4 hover:bg-muted/20">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{meeting.title}</h4>
                      <Badge variant={new Date(meeting.date) > new Date() ? 'outline' : 'secondary'} className="text-xs">
                        {new Date(meeting.date) > new Date() ? 'Upcoming' : 'Past'}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatMeetingTime(meeting.date, meeting.duration)}
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-2">
                      Location: {meeting.location}
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {meeting.participants.map((participant, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {participant}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex justify-end mt-2">
                      <Button variant="ghost" size="sm" className="flex items-center gap-1 h-7">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Join</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
