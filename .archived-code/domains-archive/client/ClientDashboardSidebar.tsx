import React, { useState } from "react";
import { ClientSidebarNavigation } from "./ClientSidebarNavigation";
import { 
  ChevronDown, 
  User, 
  LogOut, 
  Briefcase,
  FolderOpen,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "@/domains/projects/hooks/useProjects";
import { SidebarProvider, SidebarContent } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useSelectedProject } from "@/domains/projects/hooks/useSelectedProject";
import { useClientData } from "@/domains/projects/hooks/useClientData";
import { useAuthSession } from "@/lib/hooks/auth/useAuthSession";

export function ClientDashboardSidebar() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { data: currentProject } = useProjects();
  const { projects, selectProject, isNewUser } = useSelectedProject();
  const { data: clientData, isLoading: clientLoading } = useClientData();
  const { user, handleSignOut } = useAuthSession();
  
  // Function to handle project selection
  const handleProjectSelect = (projectId: string) => {
    selectProject(projectId);
  };
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case "active": return "bg-green-500/20 text-green-400 border-green-500/20";
      case "paused": return "bg-amber-500/20 text-amber-400 border-amber-500/20";
      case "completed": return "bg-blue-500/20 text-blue-400 border-blue-500/20";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/20";
    }
  };

  // Generate initials from client data or user email
  const getInitials = () => {
    if (clientData?.company_name) {
      return clientData.company_name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (clientData?.contact_name) {
      return clientData.contact_name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Get display name for the user
  const getDisplayName = () => {
    if (clientData?.company_name) return clientData.company_name;
    if (clientData?.contact_name) return clientData.contact_name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  // Get user type label
  const getUserTypeLabel = () => {
    if (clientData) return 'Client';
    return 'User';
  };
  
  return (
    <SidebarProvider defaultOpen={true}>
      <aside className="w-64 flex-shrink-0 flex flex-col h-screen bg-siso-bg border-r border-siso-border">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 flex items-center justify-center border-b border-siso-border">
            <img
              src="/lovable-uploads/c5921a2f-8856-42f4-bec5-2d08b81c5691.png"
              alt="SISO Agency"
              className="h-10 w-10 rounded-xl border border-siso-orange/60 shadow-lg bg-black/40"
            />
            <span className="ml-3 text-siso-text-bold text-lg font-bold">SISO Agency</span>
          </div>
          
          {/* Enhanced Project Selection Dropdown */}
          <div className="mx-4 my-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full h-16 justify-between bg-siso-bg-alt border-siso-border hover:bg-siso-bg-alt/80 hover:border-siso-border-hover group transition-all duration-300"
                  onClick={(e) => {
                    if (isNewUser) {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate('/onboarding-chat');
                    }
                  }}
                >
                  {isNewUser ? (
                    // For new users, just show "Create New Project" as the main button
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Plus className="h-5 w-5 flex-shrink-0 text-siso-orange group-hover:text-siso-red transition-colors" />
                      <div className="flex flex-col items-start">
                        <span className="truncate text-siso-text-bold group-hover:text-siso-text-bold transition-colors">
                          Create New Project
                        </span>
                        <span className="text-xs text-siso-text-muted">
                          Get started with your first project
                        </span>
                      </div>
                    </div>
                  ) : (
                    // For existing users, show the current project
                    <div className="flex items-center gap-3 overflow-hidden">
                      {currentProject?.logo ? (
                        <Avatar className="h-10 w-10 rounded-md border border-siso-border/30">
                          <AvatarImage src={"/lovable-uploads/c5921a2f-8856-42f4-bec5-2d08b81c5691.png"} alt={currentProject.name} />
                          <AvatarFallback className="rounded-md bg-siso-orange/20 text-siso-orange">
                            {currentProject.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <FolderOpen className="h-5 w-5 flex-shrink-0 text-siso-orange group-hover:text-siso-red transition-colors" />
                      )}
                      <div className="flex flex-col items-start">
                        <span className="truncate text-siso-text-bold group-hover:text-siso-text-bold transition-colors">
                          {currentProject ? currentProject.name : "Select a Project"}
                        </span>
                        <span className="text-xs text-siso-text-muted">
                          {currentProject?.status === 'active' ? 'Active Project' : 
                           currentProject?.status === 'paused' ? 'Paused' : 
                           currentProject?.status === 'completed' ? 'Completed' : 'Select Project'}
                        </span>
                      </div>
                    </div>
                  )}
                  <ChevronDown className="h-4 w-4 text-siso-text-muted group-hover:text-siso-text transition-colors" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="start" 
                className="w-64 bg-siso-bg-alt border-siso-border"
              >
                {!isNewUser && (
                  <>
                    <div className="py-2 px-3 text-xs font-medium text-siso-text-muted uppercase tracking-wider">
                      Your Projects
                    </div>
                    
                    {projects.map((project) => (
                      <DropdownMenuItem 
                        key={project.id}
                        className="flex items-center justify-between cursor-pointer hover:bg-black/20 py-2"
                        onClick={() => handleProjectSelect(project.id)}
                      >
                        <div className="flex items-center gap-2">
                          {project.logo ? (
                            <Avatar className="h-6 w-6 rounded-md">
                              <AvatarImage src={project.logo} />
                              <AvatarFallback className="rounded-md bg-siso-bg-alt text-siso-text-muted">
                                {project.name.substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <FolderOpen className={`h-4 w-4 ${project.status === 'active' ? 'text-siso-orange' : 'text-siso-text-muted'}`} />
                          )}
                          <span className="text-siso-text">{project.name}</span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs py-0 px-1.5 ${getStatusColor(project.status)}`}
                        >
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </Badge>
                      </DropdownMenuItem>
                    ))}
                    
                    <DropdownMenuSeparator className="bg-siso-border" />
                  </>
                )}
                
                <DropdownMenuItem 
                  className="flex items-center gap-2 cursor-pointer text-siso-orange hover:text-siso-red hover:bg-black/20"
                  onClick={() => navigate('/onboarding-chat')}
                >
                  <Plus className="h-4 w-4" />
                  <span>Create New Project</span>
                </DropdownMenuItem>
                
                {!isNewUser && (
                  <DropdownMenuItem 
                    className="text-siso-text hover:bg-black/20"
                    onClick={() => navigate('/projects')}
                  >
                    View all projects
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Main Navigation */}
          <div className="flex-1 overflow-y-auto py-2">
            <ClientSidebarNavigation collapsed={!sidebarOpen} onItemClick={() => {}} visible={true} />
          </div>
          
          {/* Dynamic User Dropdown - No more hardcoded "ubahcrypto" */}
          <div className="p-4 border-t border-siso-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start px-2 hover:bg-siso-bg-alt">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-siso-border">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-siso-bg-alt text-siso-orange">
                        {clientLoading ? '...' : getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-left">
                      <span className="text-sm font-medium text-siso-text">
                        {clientLoading ? 'Loading...' : getDisplayName()}
                      </span>
                      <span className="text-xs text-siso-text-muted">{getUserTypeLabel()}</span>
                    </div>
                    <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-siso-bg-alt border-siso-border">
                <DropdownMenuItem className="text-siso-text" onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile & Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-siso-border" />
                <DropdownMenuItem 
                  className="text-siso-text cursor-pointer"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>
    </SidebarProvider>
  );
}
