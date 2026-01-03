import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageTitle } from '@/components/admin/layout/AdminPageTitle';
import { UsersIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, ListTodo, MessageCircle, BarChart3, Filter, 
  Settings, Download, Upload, HelpCircle, Plus
} from 'lucide-react';
import { TeamMembersSection } from '@/components/admin/teams/TeamMembersSection';
import { TeamTasksSection } from '@/components/admin/teams/TeamTasksSection';
import { TeamMessagingSection } from '@/components/admin/teams/TeamMessagingSection';
import { TeamAnalyticsSection } from '@/components/admin/teams/TeamAnalyticsSection';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function AdminTeams() {
  const [activeTab, setActiveTab] = useState('members');

  const handleExport = () => {
    toast.success("Exporting team data...");
  };

  const handleImport = () => {
    toast.info("Import feature will be implemented soon");
  };

  const handleSettings = () => {
    toast.info("Teams settings will be implemented soon");
  };

  const handleHelp = () => {
    toast.info("Help documentation will be implemented soon");
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        <AdminPageTitle
          icon={UsersIcon}
          title="Team Management"
          subtitle="Manage your team members, tasks, and communication"
        />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <p className="text-muted-foreground">Manage your team members, tasks, and communication</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">View</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>All Team Members</DropdownMenuItem>
                <DropdownMenuItem>Active Only</DropdownMenuItem>
                <DropdownMenuItem>By Department</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Save Current View</DropdownMenuItem>
                <DropdownMenuItem>Manage Views</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleImport}>
              <Upload className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Import</span>
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleSettings}>
              <Settings className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleHelp}>
              <HelpCircle className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Help</span>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">5 active this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Open Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">8 due today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Scheduled Calls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">2 today, 5 this week</p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center mb-6 overflow-x-auto pb-2">
            <TabsList>
              <TabsTrigger value="members" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>Members</span>
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-1">
                <ListTodo className="h-4 w-4" />
                <span>Tasks</span>
              </TabsTrigger>
              <TabsTrigger value="communication" className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>Communication</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="members">
            <TeamMembersSection />
          </TabsContent>
          
          <TabsContent value="tasks">
            <TeamTasksSection />
          </TabsContent>
          
          <TabsContent value="communication">
            <TeamMessagingSection />
          </TabsContent>
          
          <TabsContent value="analytics">
            <TeamAnalyticsSection />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
