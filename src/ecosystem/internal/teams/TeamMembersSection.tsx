
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  UserPlus, Search, Filter, MoreHorizontal, CalendarPlus, MessageSquare, 
  Clock, Download, Upload, Columns
} from 'lucide-react';
import { TeamMemberList } from './TeamMemberList';
import { AddTeamMemberDialog } from './AddTeamMemberDialog';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export function TeamMembersSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isWhatsappDialogOpen, setIsWhatsappDialogOpen] = useState(false);
  const [isScheduleCallDialogOpen, setIsScheduleCallDialogOpen] = useState(false);

  const handleSendWhatsappMessage = () => {
    // In a real app, you'd implement this
    toast.info("WhatsApp message feature will be implemented soon");
    setIsWhatsappDialogOpen(false);
  };

  const handleScheduleCall = () => {
    // In a real app, you'd implement this
    toast.info("Call scheduling feature will be implemented soon");
    setIsScheduleCallDialogOpen(false);
  };

  const handleExportData = () => {
    toast.success("Exporting team data as CSV");
    // In a real implementation, you'd generate and download a CSV here
  };

  const handleImportData = () => {
    toast.info("Import team members feature will be implemented soon");
    // In a real implementation, you'd open a file dialog and import data
  };

  const handleShowColumnsDialog = () => {
    toast.info("Column customization feature will be implemented soon");
    // In a real implementation, you'd show a dialog to customize columns
  };

  const departments = ['Management', 'Engineering', 'Design', 'Marketing', 'Support'];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search team members..."
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
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                {showAdvancedFilters ? "Hide Advanced Filters" : "Show Advanced Filters"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSelectedRole(null);
                setSelectedDepartment(null);
                setShowAdvancedFilters(false);
              }}>
                Clear All Filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                <MoreHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Team Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsWhatsappDialogOpen(true)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Send WhatsApp Message
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsScheduleCallDialogOpen(true)}>
                <CalendarPlus className="h-4 w-4 mr-2" />
                Schedule Call
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export Team Data
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleImportData}>
                <Upload className="h-4 w-4 mr-2" />
                Import Team Members
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShowColumnsDialog}>
                <Columns className="h-4 w-4 mr-2" />
                Customize Columns
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="whitespace-nowrap">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      {showAdvancedFilters && (
        <div className="p-4 border rounded-md bg-muted/10">
          <h3 className="text-sm font-medium mb-2">Advanced Filters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Role</label>
              <div className="flex gap-2 flex-wrap">
                <Badge 
                  variant={selectedRole === null ? "default" : "outline"} 
                  className="cursor-pointer"
                  onClick={() => setSelectedRole(null)}
                >
                  All Roles
                </Badge>
                {['Admin', 'Manager', 'Developer', 'Designer', 'Marketing'].map(role => (
                  <Badge 
                    key={role} 
                    variant={selectedRole === role ? "default" : "outline"} 
                    className="cursor-pointer"
                    onClick={() => setSelectedRole(role === selectedRole ? null : role)}
                  >
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Department</label>
              <div className="flex gap-2 flex-wrap">
                <Badge 
                  variant={selectedDepartment === null ? "default" : "outline"} 
                  className="cursor-pointer"
                  onClick={() => setSelectedDepartment(null)}
                >
                  All Departments
                </Badge>
                {departments.map(department => (
                  <Badge 
                    key={department} 
                    variant={selectedDepartment === department ? "default" : "outline"} 
                    className="cursor-pointer"
                    onClick={() => setSelectedDepartment(department === selectedDepartment ? null : department)}
                  >
                    {department}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Quick Filters</h3>
        <div className="flex gap-2 flex-wrap">
          <Badge 
            variant={selectedRole === null ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={() => setSelectedRole(null)}
          >
            All Roles
          </Badge>
          {['Admin', 'Manager', 'Developer', 'Designer', 'Marketing'].map(role => (
            <Badge 
              key={role} 
              variant={selectedRole === role ? "default" : "outline"} 
              className="cursor-pointer"
              onClick={() => setSelectedRole(role === selectedRole ? null : role)}
            >
              {role}
            </Badge>
          ))}
        </div>
      </div>

      <TeamMemberList 
        searchQuery={searchQuery} 
        roleFilter={selectedRole}
        departmentFilter={selectedDepartment} 
      />
      
      <AddTeamMemberDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
      
      {/* These dialogs would be implemented in a real application */}
      {/* <SendWhatsappDialog open={isWhatsappDialogOpen} onOpenChange={setIsWhatsappDialogOpen} onSend={handleSendWhatsappMessage} /> */}
      {/* <ScheduleCallDialog open={isScheduleCallDialogOpen} onOpenChange={setIsScheduleCallDialogOpen} onSchedule={handleScheduleCall} /> */}
    </div>
  );
}
