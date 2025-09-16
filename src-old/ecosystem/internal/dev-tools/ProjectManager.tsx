import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Play, Pause, Trash2, Settings, Folder } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';

interface Project {
  id: string;
  name: string;
  path: string;
  status: 'active' | 'idle' | 'error';
  agents: number;
  lastActivity: string;
}

interface ProjectManagerProps {
  projects: Project[];
  onProjectUpdate: (projects: Project[]) => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  projects,
  onProjectUpdate
}) => {
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', path: '' });

  const handleAddProject = () => {
    if (newProject.name && newProject.path) {
      const project: Project = {
        id: Math.random().toString(36).substr(2, 9),
        name: newProject.name,
        path: newProject.path,
        status: 'idle',
        agents: 0,
        lastActivity: 'Just created'
      };
      
      onProjectUpdate([...projects, project]);
      setNewProject({ name: '', path: '' });
      setIsAddingProject(false);
    }
  };

  const handleProjectAction = (projectId: string, action: 'start' | 'stop' | 'delete') => {
    if (action === 'delete') {
      onProjectUpdate(projects.filter(p => p.id !== projectId));
    } else {
      onProjectUpdate(projects.map(p => 
        p.id === projectId 
          ? { ...p, status: action === 'start' ? 'active' : 'idle' as const }
          : p
      ));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Project Manager</h3>
          <p className="text-sm text-gray-400">Manage your development projects</p>
        </div>
        
        <Dialog open={isAddingProject} onOpenChange={setIsAddingProject}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300">Project Name</label>
                <Input
                  value={newProject.name}
                  onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Awesome Project"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Project Path</label>
                <Input
                  value={newProject.path}
                  onChange={(e) => setNewProject(prev => ({ ...prev, path: e.target.value }))}
                  placeholder="/path/to/project"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsAddingProject(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddProject}>
                  Add Project
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white">{project.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`}></div>
                    <Badge variant="secondary" className="text-xs">
                      {project.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Folder className="h-4 w-4" />
                    <span className="truncate">{project.path}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Agents: {project.agents} • {project.lastActivity}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {project.status === 'active' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleProjectAction(project.id, 'stop')}
                      className="flex items-center gap-1"
                    >
                      <Pause className="h-3 w-3" />
                      Stop
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleProjectAction(project.id, 'start')}
                      className="flex items-center gap-1"
                    >
                      <Play className="h-3 w-3" />
                      Start
                    </Button>
                  )}
                  
                  <Button size="sm" variant="outline">
                    <Settings className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleProjectAction(project.id, 'delete')}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <Folder className="h-12 w-12 mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400">No projects yet. Add your first project to get started.</p>
        </div>
      )}
    </div>
  );
};