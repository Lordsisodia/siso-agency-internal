
import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  BarChart3, 
  MessageSquare, 
  User, 
  Link2, 
  CalendarClock,
  FileText,
  Instagram,
  Users,
  Share,
  PenLine,
  History,
  UserPlus
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInstagramLeads } from '@/hooks/useInstagramLeads';
import { toast } from 'sonner';
import { formatCompactNumber } from '@/lib/formatters';

interface LeadDetailSheetProps {
  leadId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export function LeadDetailSheet({ leadId, isOpen, onClose, onUpdate }: LeadDetailSheetProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const { leads, updateLead } = useInstagramLeads();
  const [isUpdating, setIsUpdating] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  
  const lead = leads.find(l => l.id === leadId);
  
  useEffect(() => {
    if (lead) {
      setNotes(lead.notes || '');
      setSelectedStatus(lead.status);
    }
  }, [lead]);
  
  const handleSaveNotes = async () => {
    if (!lead) return;
    
    setIsUpdating(true);
    try {
      await updateLead.mutateAsync({
        id: lead.id,
        data: { notes }
      });
      
      toast.success('Notes saved successfully');
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to save notes');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleStatusChange = async (status: string) => {
    if (!lead || status === selectedStatus) return;
    
    setIsUpdating(true);
    try {
      await updateLead.mutateAsync({
        id: lead.id,
        data: { status }
      });
      
      setSelectedStatus(status);
      toast.success(`Lead status updated to ${status}`);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };
  
  if (!lead) return null;
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full md:max-w-[550px]">
        <SheetHeader className="pb-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white mr-3">
                {lead.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <SheetTitle className="text-xl">@{lead.username}</SheetTitle>
                <SheetDescription>{lead.full_name || 'Instagram Lead'}</SheetDescription>
              </div>
            </div>
            <Badge className={
              lead.status === 'converted' ? 'bg-green-500/10 text-green-500' :
              lead.status === 'contacted' ? 'bg-blue-500/10 text-blue-500' :
              'bg-amber-500/10 text-amber-500'
            }>
              {lead.status || 'New'}
            </Badge>
          </div>
        </SheetHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">
              <User className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="outreach">
              <MessageSquare className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Outreach</span>
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="notes">
              <PenLine className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Notes</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-5">
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="p-4 border rounded-md text-center">
                <div className="text-2xl font-bold mb-1">
                  {formatCompactNumber(lead.followers_count || 0)}
                </div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </div>
              <div className="p-4 border rounded-md text-center">
                <div className="text-2xl font-bold mb-1">
                  {formatCompactNumber(lead.following_count || 0)}
                </div>
                <div className="text-sm text-muted-foreground">Following</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Lead Details</h3>
              
              <div>
                <Label>Status</Label>
                <Select 
                  value={selectedStatus || undefined} 
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="not_interested">Not Interested</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Added Date</Label>
                  <Input 
                    value={new Date(lead.created_at).toLocaleDateString()} 
                    readOnly 
                    className="bg-muted/30"
                  />
                </div>
                <div>
                  <Label>Last Updated</Label>
                  <Input 
                    value={new Date(lead.last_updated || lead.created_at).toLocaleDateString()} 
                    readOnly 
                    className="bg-muted/30"
                  />
                </div>
              </div>
              
              <div>
                <Label>Instagram Profile</Label>
                <div className="flex mt-1">
                  <a 
                    href={`https://instagram.com/${lead.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline flex items-center"
                  >
                    <Instagram className="h-4 w-4 mr-2" />
                    View Profile on Instagram
                  </a>
                </div>
              </div>
              
              {lead.bio && (
                <div>
                  <Label>Bio</Label>
                  <div className="p-3 rounded-md bg-muted/30 mt-1 text-sm">
                    {lead.bio}
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-center mt-6">
              <Button variant="outline" disabled={isUpdating}>
                <Share className="h-4 w-4 mr-2" />
                Convert to Client
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="outreach" className="space-y-5">
            <div className="space-y-3 mb-5">
              <h3 className="font-medium">Outreach Actions</h3>
              
              <div className="grid grid-cols-3 gap-3">
                <Button variant="outline" className="h-auto py-2 flex flex-col items-center justify-center">
                  <UserPlus className="h-4 w-4 mb-1" />
                  <span className="text-xs">Follow</span>
                </Button>
                <Button variant="outline" className="h-auto py-2 flex flex-col items-center justify-center">
                  <MessageSquare className="h-4 w-4 mb-1" />
                  <span className="text-xs">Send DM</span>
                </Button>
                <Button variant="outline" className="h-auto py-2 flex flex-col items-center justify-center">
                  <FileText className="h-4 w-4 mb-1" />
                  <span className="text-xs">App Plan</span>
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium">Outreach History</h3>
              
              <div className="border rounded-md divide-y">
                <div className="p-3 flex items-center">
                  <div className="p-1.5 bg-muted rounded-full mr-3">
                    <UserPlus className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Follow</div>
                    <div className="text-xs text-muted-foreground">Not followed yet</div>
                  </div>
                  <Button size="sm" variant="ghost" className="ml-auto">
                    Follow
                  </Button>
                </div>
                
                <div className="p-3 flex items-center">
                  <div className="p-1.5 bg-muted rounded-full mr-3">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Direct Message</div>
                    <div className="text-xs text-muted-foreground">No messages sent</div>
                  </div>
                  <Button size="sm" variant="ghost" className="ml-auto">
                    Send
                  </Button>
                </div>
                
                <div className="p-3 flex items-center">
                  <div className="p-1.5 bg-muted rounded-full mr-3">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">App Plan</div>
                    <div className="text-xs text-muted-foreground">No plan generated</div>
                  </div>
                  <Button size="sm" variant="ghost" className="ml-auto">
                    Create
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-5">
            <div className="h-[200px] flex items-center justify-center border rounded-md p-4">
              <div className="text-center">
                <BarChart3 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Analytics coming soon...
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium">Engagement Data</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 border rounded-md text-center">
                  <div className="text-xl font-bold mb-1">-</div>
                  <div className="text-xs text-muted-foreground">Likes</div>
                </div>
                <div className="p-3 border rounded-md text-center">
                  <div className="text-xl font-bold mb-1">-</div>
                  <div className="text-xs text-muted-foreground">Comments</div>
                </div>
                <div className="p-3 border rounded-md text-center">
                  <div className="text-xl font-bold mb-1">-</div>
                  <div className="text-xs text-muted-foreground">Rate</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium">Posts Analysis</h3>
              <div className="text-center p-6 border rounded-md text-muted-foreground">
                Post data analysis will be available soon
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="notes" className="space-y-5">
            <div>
              <Label htmlFor="notes">Notes about this lead</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this lead..."
                className="min-h-[200px] mt-2"
              />
            </div>
            
            <div className="text-right">
              <Button 
                onClick={handleSaveNotes} 
                disabled={isUpdating}
              >
                Save Notes
              </Button>
            </div>
            
            <div className="space-y-3 mt-6">
              <h3 className="font-medium flex items-center">
                <History className="h-4 w-4 mr-2" />
                Activity History
              </h3>
              <div className="text-sm text-muted-foreground p-4 text-center border rounded-md">
                No activity history available
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
