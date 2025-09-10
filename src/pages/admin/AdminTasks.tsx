import React, { useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/shared/ui/resizable';
import { supabase } from '@/integrations/supabase/client';
import AdminTaskDetailModal from '@/components/admin/AdminTaskDetailModal';
import { CheckCircle2 } from 'lucide-react';
import EnhancedTaskItem from '@/components/tasks/EnhancedTaskItem';

// Extracted components and hooks
import {
  TaskHeader,
  TaskStats,
  ProjectContextCard,
  TaskMainContent,
  TaskFilterSidebar,
  AITaskChat
} from './components';
import useAdminTasks from './hooks/useAdminTasks';

const AdminTasks: React.FC = () => {
  const {
    // View state
    currentView,
    setCurrentView,
    
    // Task selection state
    selectedTaskForModal,
    isTaskModalOpen,
    
    // Filter state
    selectedFilter,
    setSelectedFilter,
    selectedPriority,
    setSelectedPriority,
    
    // Dropdown state
    showViewDropdown,
    setShowViewDropdown,
    showContextMenu,
    setShowContextMenu,
    showOptionsMenu,
    setShowOptionsMenu,
    
    // Project context state
    showProjectContextCard,
    setShowProjectContextCard,
    selectedProject,
    setSelectedProject,
    
    // Chat state
    chatMessages,
    setChatMessages,
    
    // AI state
    isAIEnabled,
    
    // Task data
    tasks,
    filteredTasks,
    activeTasks,
    completedTasks,
    isLoading,
    
    // Task operations
    toggleTask,
    updateTaskStatus,
    handleCreateTask,
    handleDeleteTask,
    handleEditTask,
    toggleSubtask,
    handleDateChange,
    openEditTask,
    handleTaskModalSave,
    handleTaskModalClose,
    
    // Project context operations
    saveProjectContext,
    getCurrentProjectContext,
    
    // Filter data
    filterCategories,
    
    // Mutations
    updateTaskMutation,
    createTaskMutation,
    deleteTaskMutation,
    refetchTasks
  } = useAdminTasks();

  // Temporary state for completed tasks toggle (will be moved to TaskListManager)
  const [showCompletedTasks, setShowCompletedTasks] = React.useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      if (showViewDropdown && !target.closest('.view-dropdown-container')) {
        setShowViewDropdown(false);
      }
      
      if (showContextMenu && !target.closest('.context-menu-container')) {
        setShowContextMenu(false);
      }
      
      if (showOptionsMenu && !target.closest('.options-menu-container')) {
        setShowOptionsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showViewDropdown, showContextMenu, showOptionsMenu, setShowViewDropdown, setShowContextMenu, setShowOptionsMenu]);

  return (
    <AdminLayout>
      <div className="h-screen text-white overflow-hidden" style={{ backgroundColor: '#252525' }}>
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel - Filters + AI Task Assistant */}
          <ResizablePanel defaultSize={40} minSize={25} maxSize={60} className="min-h-0" style={{ backgroundColor: '#252525' }}>
            <ResizablePanelGroup direction="horizontal" className="h-full">
              {/* Task Filter Sidebar - Resizable */}
              <ResizablePanel defaultSize={35} minSize={20} maxSize={50} className="min-h-0">
                <TaskFilterSidebar
                  selectedFilter={selectedFilter}
                  selectedPriority={selectedPriority}
                  onFilterChange={(filter, priority) => {
                    setSelectedFilter(filter);
                    if (priority) setSelectedPriority(priority);
                  }}
                  taskCounts={{
                    all: filteredTasks.length,
                    urgent: filteredTasks.filter(t => t.priority === 'urgent').length,
                    high: filteredTasks.filter(t => t.priority === 'high').length,
                    medium: filteredTasks.filter(t => t.priority === 'medium').length,
                    low: filteredTasks.filter(t => t.priority === 'low').length,
                    development: filteredTasks.filter(t => t.category === 'development').length,
                    marketing: filteredTasks.filter(t => t.category === 'marketing').length,
                    design: filteredTasks.filter(t => t.category === 'design').length,
                    client: filteredTasks.filter(t => t.category === 'client').length,
                    admin: filteredTasks.filter(t => t.category === 'admin').length
                  }}
                  onAddProject={async (projectName) => {
                    try {
                      const { data: userData } = await supabase.auth.getUser();
                      if (!userData?.user) {
                        console.error('User not authenticated');
                        return;
                      }

                      const { data, error } = await supabase
                        .from('projects')
                        .insert({
                          name: projectName,
                          user_id: userData.user.id,
                          status: 'active',
                          description: `Project: ${projectName}`,
                          completion_percentage: 0
                        })
                        .select()
                        .single();

                      if (error) throw error;

                      console.log(`Project "${projectName}" created successfully!`);
                      refetchTasks();
                    } catch (error) {
                      console.error('Error creating project:', error);
                    }
                  }}
                />
              </ResizablePanel>

              {/* Resizable Handle between Filter and Chat */}
              <ResizableHandle className="bg-gray-700 hover:bg-orange-500 transition-colors duration-200" />
              
              {/* AI Chat - Right Side of Left Panel */}
              <ResizablePanel defaultSize={65} minSize={50} maxSize={80} className="min-h-0">
                <div className="h-full">
                  <AITaskChat
                    tasks={tasks}
                    chatMessages={chatMessages}
                    onTasksUpdate={(updatedTasks) => console.log('Tasks updated:', updatedTasks)}
                    onChatUpdate={setChatMessages}
                    onTaskRefresh={refetchTasks}
                    isAIEnabled={isAIEnabled}
                  />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          {/* Resizable Handle */}
          <ResizableHandle className="bg-gray-700 hover:bg-orange-500 transition-colors duration-200" />

          {/* Right Panel - Tasks Section */}
          <ResizablePanel defaultSize={60} minSize={40} maxSize={75}>
            <div className="h-full p-4 flex items-center justify-center" style={{ backgroundColor: '#121212' }}>
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col w-full max-w-4xl h-[calc(100vh-2rem)] mx-4">
                {/* Header */}
                <TaskHeader
                  completedTasksCount={completedTasks.length}
                  activeTasksCount={activeTasks.length}
                  showContextMenu={showContextMenu}
                  onContextMenuToggle={() => setShowContextMenu(!showContextMenu)}
                  onProjectSelect={setSelectedProject}
                  onProjectContextShow={() => setShowProjectContextCard(true)}
                  onContextMenuClose={() => setShowContextMenu(false)}
                />

                {/* Main Content Area */}
                <TaskMainContent
                  selectedFilter={selectedFilter}
                  currentView={currentView}
                  onViewChange={setCurrentView}
                  showViewDropdown={showViewDropdown}
                  onToggleViewDropdown={setShowViewDropdown}
                  tasks={tasks}
                  filteredTasks={filteredTasks}
                  activeTasks={activeTasks}
                  completedTasks={completedTasks}
                  selectedPriority={selectedPriority}
                  filterCategories={filterCategories}
                  user={null} // Will be passed from useAdminTasks in future iteration
                  toggleTask={toggleTask}
                  updateTaskStatus={updateTaskStatus}
                  handleCreateTask={handleCreateTask}
                  handleDeleteTask={handleDeleteTask}
                  handleEditTask={handleEditTask}
                  toggleSubtask={toggleSubtask}
                  handleDateChange={handleDateChange}
                  openEditTask={openEditTask}
                  createTaskMutation={createTaskMutation}
                  deleteTaskMutation={deleteTaskMutation}
                  setSelectedFilter={setSelectedFilter}
                  setSelectedPriority={setSelectedPriority}
                />

                {/* Task Stats */}
                <TaskStats
                  activeTasksCount={activeTasks.length}
                  completedTasksCount={completedTasks.length}
                  showCompletedTasks={showCompletedTasks}
                  onToggleCompletedTasks={() => setShowCompletedTasks(!showCompletedTasks)}
                />

                {/* Completed Tasks List */}
                {showCompletedTasks && (
                  <div className="flex-shrink-0 border-t border-white/20" style={{ backgroundColor: '#1a1a1a' }} data-completed-tasks-section>
                    <div className="p-3 sm:p-4">
                      <h3 className="text-lg font-semibold text-green-400 mb-4">Completed Tasks</h3>
                      <div className="space-y-2">
                        {completedTasks.length === 0 ? (
                          <div className="text-center py-8">
                            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3 opacity-50" />
                            <p className="text-gray-400">No completed tasks yet</p>
                            <p className="text-gray-500 text-sm mt-1">Complete some tasks to see them here!</p>
                          </div>
                        ) : (
                          completedTasks.map((task, index) => (
                            <EnhancedTaskItem
                              key={task.id}
                              task={task}
                              onToggle={toggleTask}
                              onEdit={handleEditTask}
                              onDelete={handleDeleteTask}
                              onSubtaskToggle={toggleSubtask}
                              onDateChange={handleDateChange}
                              showSubtasksOnHover={true}
                              isLast={index === completedTasks.length - 1}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>

        {/* Task Detail Modal */}
        <AdminTaskDetailModal
          task={selectedTaskForModal}
          isOpen={isTaskModalOpen}
          onClose={handleTaskModalClose}
          onSave={handleTaskModalSave}
          onSubtaskToggle={toggleSubtask}
        />

        {/* Project Context Card Overlay */}
        <ProjectContextCard
          selectedProject={selectedProject}
          isVisible={showProjectContextCard}
          onClose={() => setShowProjectContextCard(false)}
          currentContext={getCurrentProjectContext()}
          onContextChange={saveProjectContext}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminTasks;