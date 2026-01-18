import React, { useState } from 'react';
import { 
  Sheet, SheetClose, SheetContent, SheetDescription, 
  SheetHeader, SheetTitle, SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Mail, Phone, MapPin, Calendar, Clock, MessageSquare,
  FileText, BarChart2, User, Shield, Edit, 
  CalendarPlus, CheckCircle, AlertCircle, ArrowDownUp, 
  MessageCircle, Home, Briefcase
} from 'lucide-react';
import { TeamMember } from './TeamMemberList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamMemberActivity } from './TeamMemberActivity';
import { TeamMemberTasks } from './TeamMemberTasks';
import { toast } from 'sonner';

interface TeamMemberDetailsProps {
  member: TeamMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TeamMemberDetails({ member, open, onOpenChange }: TeamMemberDetailsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  if (!member) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'busy': return 'bg-red-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': 
      default: return 'bg-gray-500';
    }
  };

  const handleSendWhatsApp = () => {
    toast.info(`WhatsApp message would be sent to ${member.name}`);
  };

  const handleScheduleCall = () => {
    toast.info(`Call scheduling dialog would open for ${member.name}`);
  };

  const handleEditMember = () => {
    toast.info(`Edit member dialog would open for ${member.name}`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle>Team Member Details</SheetTitle>
          <SheetDescription>
            View and manage team member information
          </SheetDescription>
        </SheetHeader>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage src={member.avatar} />
              <AvatarFallback className="text-lg bg-primary/10">
                {member.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(member.status)}`} />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{member.name}</h3>
            <p className="text-sm text-muted-foreground">{member.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {member.role}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                {member.department}
              </Badge>
            </div>
          </div>
          
          <Button variant="outline" size="icon" onClick={handleEditMember}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>

        <Separator className="my-4" />

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
            <TabsTrigger value="tasks" className="flex-1">Tasks</TabsTrigger>
            <TabsTrigger value="communication" className="flex-1">Communication</TabsTrigger>
            <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 pt-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Contact Information</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${member.email}`} className="hover:underline">{member.email}</a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  <span>+1 (555) 123-4567</span>
                  {member.whatsappStatus && (
                    <Badge 
                      variant="outline" 
                      className={`ml-2 ${
                        member.whatsappStatus === 'received' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                        member.whatsappStatus === 'sent' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                        'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}
                    >
                      {member.whatsappStatus.charAt(0).toUpperCase() + member.whatsappStatus.slice(1)}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Remote</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <span>Los Angeles, CA</span>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Team Details</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined: {new Date(member.joinDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Last active: {member.lastActive}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span>Access level: Standard</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>Reports to: Alex Johnson</span>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium text-sm mb-2">Skills & Expertise</h4>
              <div className="flex flex-wrap gap-1">
                {member.skills?.map(skill => (
                  <Badge key={skill} variant="outline" className="bg-primary/5">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-2">
              <Card>
                <CardHeader className="p-3">
                  <CardTitle className="text-sm flex items-center gap-1">
                    <FileText className="h-4 w-4" /> Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-2xl font-bold">
                    {member.tasks ? `${member.tasks.completed}/${member.tasks.total}` : "0/0"}
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden my-1">
                    <div 
                      className="h-full bg-green-500" 
                      style={{ 
                        width: member.tasks 
                          ? `${(member.tasks.completed / member.tasks.total) * 100}%`
                          : "0%" 
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {member.tasks 
                      ? `${member.tasks.completed} completed, ${member.tasks.total - member.tasks.completed} pending` 
                      : "No tasks assigned"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="p-3">
                  <CardTitle className="text-sm flex items-center gap-1">
                    <CalendarPlus className="h-4 w-4" /> Next Call
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  {member.nextCall ? (
                    <>
                      <div className="text-sm font-medium">{member.nextCall.title}</div>
                      <p className="text-xs mt-1">{new Date(member.nextCall.date).toLocaleDateString()}</p>
                    </>
                  ) : (
                    <>
                      <div className="text-sm text-muted-foreground">No calls scheduled</div>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="px-0 h-6 text-xs" 
                        onClick={handleScheduleCall}
                      >
                        Schedule now
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="tasks" className="pt-4">
            <TeamMemberTasks memberId={member.id} />
          </TabsContent>
          
          <TabsContent value="communication" className="pt-4 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">WhatsApp Communication</h3>
              <Button size="sm" variant="outline" onClick={handleSendWhatsApp}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Today, 9:30 AM</span>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                    Sent
                  </Badge>
                </div>
                <p className="text-sm">
                  Good morning! Please update the client presentation by 2PM today. Thanks!
                </p>
              </div>
              
              <div className="bg-primary/5 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Today, 10:15 AM</span>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                    Received
                  </Badge>
                </div>
                <p className="text-sm">
                  I'll have it ready by 1:30 PM. Working on the final slides now.
                </p>
              </div>
              
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Yesterday, 4:45 PM</span>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                    Sent
                  </Badge>
                </div>
                <p className="text-sm">
                  Here are the tasks for tomorrow: 1) Client call at 11AM, 2) Update website content, 3) Review new designs
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Scheduled Calls</h3>
              <div className="space-y-2">
                {member.nextCall ? (
                  <Card>
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <CalendarPlus className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{member.nextCall.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(member.nextCall.date).toLocaleDateString()}, 10:00 AM
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Details</Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    No calls scheduled
                  </div>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2" 
                onClick={handleScheduleCall}
              >
                <CalendarPlus className="h-4 w-4 mr-2" />
                Schedule Call
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="activity" className="pt-4">
            <TeamMemberActivity memberId={member.id} />
          </TabsContent>
        </Tabs>
        
        <SheetFooter className="mt-4 flex space-x-2">
          <Button className="flex-1" onClick={handleSendWhatsApp}>
            <MessageSquare className="h-4 w-4 mr-2" /> Message
          </Button>
          <Button className="flex-1" variant="outline" onClick={handleScheduleCall}>
            <CalendarPlus className="h-4 w-4 mr-2" /> Schedule Call
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
