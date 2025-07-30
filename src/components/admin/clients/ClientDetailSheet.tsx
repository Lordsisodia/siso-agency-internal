
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientDetails } from '@/hooks/client';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ClientStatusBadge } from './ClientStatusBadge';
import { TodoList } from './TodoList';
import { Calendar, ArrowUpRightSquare, ClipboardList, Mail, MessageSquare } from 'lucide-react';

interface ClientDetailSheetProps {
  clientId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ClientDetailSheet({ clientId, isOpen, onClose }: ClientDetailSheetProps) {
  const { clientData, loading, updateClient, updateTodos, isUpdating } = useClientDetails(clientId);
  const navigate = useNavigate();
  
  const viewFullDetails = () => {
    if (clientData) {
      navigate(`/admin/clients/${clientData.id}`);
      onClose();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        {loading || !clientData ? (
          <div className="space-y-6 pt-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-3 w-[150px]" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ) : (
          <>
            <SheetHeader className="pb-4">
              <div className="flex justify-between items-start">
                <SheetTitle className="text-2xl">{clientData.full_name || 'Unnamed Client'}</SheetTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={viewFullDetails}
                >
                  <ArrowUpRightSquare className="h-4 w-4" />
                  View Full Details
                </Button>
              </div>
              <SheetDescription>
                {clientData.business_name || 'No business name provided'}
              </SheetDescription>
            </SheetHeader>
            
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16 border-2 border-muted">
                <AvatarImage src={clientData.avatar_url || undefined} alt={clientData.full_name || 'Client'} />
                <AvatarFallback className="text-lg bg-primary/10">
                  {clientData.full_name?.substring(0, 2).toUpperCase() || 'CL'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex flex-col gap-1">
                <ClientStatusBadge status={clientData.status} />
                
                <div className="flex items-center gap-2">
                  {clientData.email && (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Mail className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Calendar className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ClipboardList className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mb-6">
              {clientData.project_name && (
                <div>
                  <span className="text-sm font-medium">Project:</span>{' '}
                  <span className="text-sm">{clientData.project_name}</span>
                </div>
              )}
              {clientData.company_niche && (
                <div>
                  <span className="text-sm font-medium">Industry:</span>{' '}
                  <span className="text-sm">{clientData.company_niche}</span>
                </div>
              )}
              {clientData.website_url && (
                <div>
                  <span className="text-sm font-medium">Website:</span>{' '}
                  <a 
                    href={clientData.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {clientData.website_url}
                  </a>
                </div>
              )}
              <div>
                <span className="text-sm font-medium">Client Since:</span>{' '}
                <span className="text-sm">{new Date(clientData.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <Tabs defaultValue="overview">
              <TabsList className="mb-4 grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Project Status</h3>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="border rounded p-3">
                      <div className="text-sm text-muted-foreground">Onboarding</div>
                      <div className="text-2xl font-semibold mt-1">
                        {clientData.current_step || 0}/{clientData.total_steps || 5}
                      </div>
                    </div>
                    
                    <div className="border rounded p-3">
                      <div className="text-sm text-muted-foreground">Completion</div>
                      <div className="text-2xl font-semibold mt-1">
                        {Math.round((clientData.current_step / (clientData.total_steps || 5)) * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
                
                {clientData.notion_plan_url && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Project Plan</h3>
                    <a 
                      href={clientData.notion_plan_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 border rounded hover:bg-muted/50"
                    >
                      <svg width="24" height="24" viewBox="0 0 120 126" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.6927 21.9927C24.5927 25.4927 25.7927 24.9927 35.4927 23.9927L96.1927 17.3927C97.3927 17.3927 96.4927 16.2927 95.9927 16.0927L85.4927 8.59271C83.3927 6.89271 80.5927 4.79271 74.7927 5.49271L17.6927 12.8927C15.9927 13.1927 15.4927 14.2927 16.1927 14.9927L20.6927 21.9927Z" fill="black"/>
                        <path d="M22.1927 37.1927V105.793C22.1927 109.793 24.1927 111.093 28.9927 110.793L96.6927 103.593C101.493 103.293 102.993 100.793 102.993 97.1927V29.2927C102.993 25.6927 101.193 23.7927 97.1927 24.0927L27.9927 31.4927C23.8927 31.9927 22.1927 33.5927 22.1927 37.1927Z" fill="white"/>
                        <path d="M60.1927 40.4928C60.1927 41.9928 58.8927 43.4928 56.7927 43.5928L32.5927 45.8928V81.3928C32.5927 83.7928 31.1927 85.1928 28.9927 85.3928C26.7927 85.5928 25.0927 84.4928 25.0927 81.9928V33.8928C25.0927 31.3928 26.3927 29.7928 28.9927 29.3928L56.9927 26.2928C58.8927 25.9928 60.1927 27.7928 60.1927 29.6928V40.4928Z" fill="black"/>
                        <path d="M63.1927 56.9928V97.1928C63.1927 99.9928 64.9928 100.893 67.3928 98.6928L99.7928 69.6928C101.393 68.1928 101.093 66.7928 99.0928 66.4928L67.9928 62.0928C64.9928 61.4928 63.1927 62.9928 63.1927 65.7928V80.9928L63.1927 56.9928Z" fill="#F2F2F2"/>
                      </svg>
                      <div>
                        <div className="font-medium">Notion Project Plan</div>
                        <div className="text-sm text-muted-foreground">View detailed project plan in Notion</div>
                      </div>
                    </a>
                  </div>
                )}
                
                <div className="mt-4">
                  <Button onClick={viewFullDetails} className="w-full">
                    View Complete Project Details
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="tasks">
                <h3 className="text-lg font-medium mb-4">Tasks & To-Do Items</h3>
                <TodoList 
                  todos={clientData.todos || []} 
                  clientId={clientData.id}
                  onUpdate={(todos) => updateTodos(todos)}
                  disabled={isUpdating}
                />
              </TabsContent>
              
              <TabsContent value="documents">
                <h3 className="text-lg font-medium mb-4">Documents & Links</h3>
                <div className="space-y-2">
                  {clientData.notion_plan_url && (
                    <a 
                      href={clientData.notion_plan_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 border rounded hover:bg-muted/50"
                    >
                      <svg width="20" height="20" viewBox="0 0 120 126" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.6927 21.9927C24.5927 25.4927 25.7927 24.9927 35.4927 23.9927L96.1927 17.3927C97.3927 17.3927 96.4927 16.2927 95.9927 16.0927L85.4927 8.59271C83.3927 6.89271 80.5927 4.79271 74.7927 5.49271L17.6927 12.8927C15.9927 13.1927 15.4927 14.2927 16.1927 14.9927L20.6927 21.9927Z" fill="black"/>
                        <path d="M22.1927 37.1927V105.793C22.1927 109.793 24.1927 111.093 28.9927 110.793L96.6927 103.593C101.493 103.293 102.993 100.793 102.993 97.1927V29.2927C102.993 25.6927 101.193 23.7927 97.1927 24.0927L27.9927 31.4927C23.8927 31.9927 22.1927 33.5927 22.1927 37.1927Z" fill="white"/>
                        <path d="M60.1927 40.4928C60.1927 41.9928 58.8927 43.4928 56.7927 43.5928L32.5927 45.8928V81.3928C32.5927 83.7928 31.1927 85.1928 28.9927 85.3928C26.7927 85.5928 25.0927 84.4928 25.0927 81.9928V33.8928C25.0927 31.3928 26.3927 29.7928 28.9927 29.3928L56.9927 26.2928C58.8927 25.9928 60.1927 27.7928 60.1927 29.6928V40.4928Z" fill="black"/>
                        <path d="M63.1927 56.9928V97.1928C63.1927 99.9928 64.9928 100.893 67.3928 98.6928L99.7928 69.6928C101.393 68.1928 101.093 66.7928 99.0928 66.4928L67.9928 62.0928C64.9928 61.4928 63.1927 62.9928 63.1927 65.7928V80.9928L63.1927 56.9928Z" fill="#F2F2F2"/>
                      </svg>
                      <span>Notion Project Plan</span>
                    </a>
                  )}
                  
                  {clientData.website_url && (
                    <a 
                      href={clientData.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 border rounded hover:bg-muted/50"
                    >
                      <Globe className="h-5 w-5" />
                      <span>Client Website</span>
                    </a>
                  )}
                  
                  {clientData.development_url && (
                    <a 
                      href={clientData.development_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 border rounded hover:bg-muted/50"
                    >
                      <Code className="h-5 w-5" />
                      <span>Development Site</span>
                    </a>
                  )}
                  
                  <div className="mt-4">
                    <Button onClick={viewFullDetails} className="w-full">
                      View All Documents
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

// Import these icons for the ClientDetailSheet
function Globe(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" x2="22" y1="12" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function Code(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
