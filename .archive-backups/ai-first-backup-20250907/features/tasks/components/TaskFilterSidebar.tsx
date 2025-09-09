import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { 
  Filter, 
  List, 
  Flag, 
  AlertTriangle, 
  Clock, 
  CheckCircle2,
  BarChart3,
  Users,
  Archive,
  Eye,
  ChevronDown,
  ChevronRight,
  Plus,
  FolderOpen,
  Folder
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FilterOption {
  value: string;
  label: string;
  icon: string;
  color: string;
  children?: FilterOption[];
}

interface TaskFilterSidebarProps {
  selectedFilter: string;
  selectedPriority: string;
  onFilterChange: (filter: string, priority?: string) => void;
  taskCounts: {
    all: number;
    urgent: number;
    high: number;
    medium: number;
    low: number;
    development: number;
    marketing: number;
    design: number;
    client: number;
    admin: number;
  };
  onAddProject?: (projectName: string) => void;
  refreshProjects?: boolean;
}

export const TaskFilterSidebar: React.FC<TaskFilterSidebarProps> = ({
  selectedFilter,
  selectedPriority,
  onFilterChange,
  taskCounts,
  onAddProject,
  refreshProjects
}) => {
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    general: true,
    timeline: true,
    priority: true,
    projects: true,
    stats: false
  });
  const [expandedProjects, setExpandedProjects] = useState<{[key: string]: boolean}>({});
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [dynamicProjects, setDynamicProjects] = useState<FilterOption[]>([]);

  // Load projects from database
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const { data: projects, error } = await supabase
          .from('projects')
          .select('id, name, status')
          .eq('status', 'active')
          .order('name');

        if (error) throw error;

        const projectOptions: FilterOption[] = projects.map(project => ({
          value: project.id,
          label: project.name,
          icon: '📁',
          color: 'bg-blue-600'
        }));

        setDynamicProjects(projectOptions);
      } catch (error) {
        console.error('Error loading projects:', error);
      }
    };

    loadProjects();
  }, [refreshProjects]);

  const filterCategories = {
    general: [
      { value: 'all', label: 'All Tasks', icon: '📋', color: 'bg-gray-700' },
      { value: 'overdue', label: 'Overdue', icon: '🔥', color: 'bg-red-700' },
      { value: 'completed', label: 'Completed', icon: '✅', color: 'bg-green-700' }
    ],
    timeline: [
      { value: 'today', label: 'Today', icon: '⚡', color: 'bg-red-600' },
      { value: 'this-week', label: 'This Week', icon: '📅', color: 'bg-orange-600' },
      { value: 'this-month', label: 'This Month', icon: '🗓️', color: 'bg-yellow-600' },
      { value: 'someday', label: 'Someday', icon: '💭', color: 'bg-blue-600' }
    ],
    priority: [
      { value: 'urgent', label: 'Urgent', icon: '🔥', color: 'bg-red-600' },
      { value: 'high', label: 'High', icon: '🟠', color: 'bg-orange-600' },
      { value: 'medium', label: 'Medium', icon: '🟡', color: 'bg-yellow-600' },
      { value: 'low', label: 'Low', icon: '🟢', color: 'bg-green-600' }
    ],
    projects: [
      // Static projects for legacy support
      { value: 'ubahcrypt', label: 'Ubahcrypt', icon: '🔐', color: 'bg-purple-600' },
      { 
        value: 'siso-agency', 
        label: 'SISO Agency App', 
        icon: '🏢', 
        color: 'bg-blue-600',
        children: [
          { value: 'siso-client', label: 'Client Side', icon: '👤', color: 'bg-blue-500' },
          { value: 'siso-admin', label: 'Admin Side', icon: '⚙️', color: 'bg-blue-700' },
          { value: 'siso-partnership', label: 'Partnership Side', icon: '🤝', color: 'bg-blue-400' }
        ]
      },
      { value: 'excursions', label: 'We Are Excursions', icon: '🏝️', color: 'bg-teal-600' },
      { value: 'siso-life', label: 'SISO LIFE', icon: '🌱', color: 'bg-emerald-600' },
      // Dynamic projects from database
      ...dynamicProjects
    ]
  };

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const toggleProject = (projectKey: string) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectKey]: !prev[projectKey]
    }));
  };

  const handleAddProject = async () => {
    if (newProjectName.trim() && onAddProject) {
      await onAddProject(newProjectName.trim());
      setNewProjectName('');
      setShowAddProject(false);
      
      // Refresh projects list
      try {
        const { data: projects, error } = await supabase
          .from('projects')
          .select('id, name, status')
          .eq('status', 'active')
          .order('name');

        if (error) throw error;

        const projectOptions: FilterOption[] = projects.map(project => ({
          value: project.id,
          label: project.name,
          icon: '📁',
          color: 'bg-blue-600'
        }));

        setDynamicProjects(projectOptions);
      } catch (error) {
        console.error('Error refreshing projects:', error);
      }
    }
  };

  const getTaskCount = (filter: string): number => {
    switch (filter) {
      case 'all': return taskCounts.all;
      case 'today': return taskCounts.urgent; // Map today to urgent for now
      case 'this-week': return taskCounts.high; // Map this-week to high for now
      case 'this-month': return taskCounts.medium; // Map this-month to medium for now
      case 'someday': return taskCounts.backlog; // Map someday to backlog for now
      case 'overdue': return taskCounts.urgent; // Map overdue to urgent for now
      case 'completed': return taskCounts.all; // Will be filtered properly
      case 'urgent': return taskCounts.urgent;
      case 'high': return taskCounts.high;
      case 'medium': return taskCounts.medium;
      case 'low': return taskCounts.low;
      case 'development': return taskCounts.development;
      case 'marketing': return taskCounts.marketing;
      case 'design': return taskCounts.design;
      case 'client': return taskCounts.client;
      case 'admin': return taskCounts.admin;
      default: return 0;
    }
  };

  const renderFilterSection = (
    title: string,
    options: FilterOption[],
    sectionKey: string
  ) => {
    const isExpanded = expandedSections[sectionKey];
    
    return (
      <div className="mb-4">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 hover:text-gray-300 transition-colors"
        >
          <div className="flex items-center gap-1">
            <Filter className="h-3 w-3" />
            {title}
          </div>
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </button>
        
        {isExpanded && (
          <div className="space-y-1">
            {options.map((option) => (
              <div key={option.value}>
                {/* Main option button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => option.children ? toggleProject(option.value) : onFilterChange(option.value)}
                  className={`w-full justify-start text-left px-2 py-2 h-auto rounded-md transition-all duration-200 ${
                    selectedFilter === option.value
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      {option.children && (
                        expandedProjects[option.value] ? (
                          <FolderOpen className="h-3 w-3" />
                        ) : (
                          <Folder className="h-3 w-3" />
                        )
                      )}
                      <span className="text-xs">{option.icon}</span>
                      <span className="text-xs font-medium">{option.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getTaskCount(option.value) > 0 && (
                        <Badge 
                          variant="secondary" 
                          className={`text-xs px-1 py-0 ${
                            selectedFilter === option.value 
                              ? 'bg-orange-500/30 text-orange-200' 
                              : 'bg-gray-700 text-gray-300'
                          }`}
                        >
                          {getTaskCount(option.value)}
                        </Badge>
                      )}
                      {selectedFilter === option.value && (
                        <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                      )}
                      {option.children && (
                        expandedProjects[option.value] ? (
                          <ChevronDown className="h-2 w-2" />
                        ) : (
                          <ChevronRight className="h-2 w-2" />
                        )
                      )}
                    </div>
                  </div>
                </Button>
                
                {/* Sub-options (children) */}
                {option.children && expandedProjects[option.value] && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-gray-700/50 pl-2">
                    {option.children.map((child) => (
                      <Button
                        key={child.value}
                        variant="ghost"
                        size="sm"
                        onClick={() => onFilterChange(child.value)}
                        className={`w-full justify-start text-left px-2 py-1 h-auto rounded-md transition-all duration-200 ${
                          selectedFilter === child.value
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                            : 'text-gray-400 hover:bg-gray-800/30 hover:text-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <span className="text-xs">{child.icon}</span>
                            <span className="text-xs">{child.label}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {getTaskCount(child.value) > 0 && (
                              <Badge 
                                variant="secondary" 
                                className={`text-xs px-1 py-0 ${
                                  selectedFilter === child.value 
                                    ? 'bg-orange-500/30 text-orange-200' 
                                    : 'bg-gray-600 text-gray-400'
                                }`}
                              >
                                {getTaskCount(child.value)}
                              </Badge>
                            )}
                            {selectedFilter === child.value && (
                              <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Add Project Button for Projects section */}
            {sectionKey === 'projects' && (
              <div className="mt-2">
                {!showAddProject ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddProject(true)}
                    className="w-full justify-start text-left px-2 py-2 h-auto rounded-md text-gray-400 hover:bg-gray-800/30 hover:text-gray-300 border border-dashed border-gray-600 hover:border-orange-500/50"
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="h-3 w-3" />
                      <span className="text-xs">Add Project</span>
                    </div>
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Project name..."
                      className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddProject()}
                      autoFocus
                    />
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={handleAddProject}
                        className="text-xs px-2 py-1 h-6 bg-orange-500 hover:bg-orange-600"
                      >
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setShowAddProject(false);
                          setNewProjectName('');
                        }}
                        className="text-xs px-2 py-1 h-6 text-gray-400 hover:text-white"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-black/30 border-r border-gray-700/50 backdrop-blur-sm">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700/50">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-orange-400" />
          <h2 className="text-white text-sm font-semibold">Filters</h2>
        </div>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        <div className="space-y-4">
          {renderFilterSection('General', filterCategories.general, 'general')}
          {renderFilterSection('Timeline', filterCategories.timeline, 'timeline')}
          {renderFilterSection('Priority', filterCategories.priority, 'priority')}
          {renderFilterSection('Projects', filterCategories.projects, 'projects')}
        </div>
      </div>
      
      {/* Bottom Stats - Fixed */}
      <div className="flex-shrink-0 p-3 border-t border-gray-700/50 bg-black/20">
        <button
          onClick={() => toggleSection('stats')}
          className="w-full flex items-center justify-between text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 hover:text-gray-300 transition-colors"
        >
          <div className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            Stats
          </div>
          {expandedSections.stats ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </button>
        
        {expandedSections.stats && (
          <div className="grid grid-cols-1 gap-2">
            <div className="bg-gray-800/30 rounded-md p-2 text-center">
              <div className="text-sm font-bold text-orange-400">
                {taskCounts.all}
              </div>
              <div className="text-xs text-gray-400">Total Tasks</div>
            </div>
            <div className="bg-gray-800/30 rounded-md p-2 text-center">
              <div className="text-sm font-bold text-red-400">
                {taskCounts.urgent}
              </div>
              <div className="text-xs text-gray-400">🔥 Urgent</div>
            </div>
            <div className="bg-gray-800/30 rounded-md p-2 text-center">
              <div className="text-sm font-bold text-orange-400">
                {taskCounts.high}
              </div>
              <div className="text-xs text-gray-400">🟠 High</div>
            </div>
            <div className="bg-gray-800/30 rounded-md p-2 text-center">
              <div className="text-sm font-bold text-yellow-400">
                {taskCounts.medium}
              </div>
              <div className="text-xs text-gray-400">🟡 Medium</div>
            </div>
            <div className="bg-gray-800/30 rounded-md p-2 text-center">
              <div className="text-sm font-bold text-green-400">
                {taskCounts.low}
              </div>
              <div className="text-xs text-gray-400">🟢 Low</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};