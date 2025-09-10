import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { PartnerProject } from '../components/TableRow';

/**
 * useAirtablePartners Hook
 * 
 * Consolidates all state management and business logic for the AirtablePartnersTable.
 * Handles data loading, CRUD operations, cell editing, keyboard navigation, and context menu actions.
 * 
 * Extracted from AirtablePartnersTable.tsx (1,196 lines → focused hook)
 */

interface ContextMenuState {
  x: number;
  y: number;
  visible: boolean;
}

interface CellPosition {
  rowIndex: number;
  field: string;
}

export interface UseAirtablePartnersReturn {
  // Data state
  data: PartnerProject[];
  isLoading: boolean;
  
  // Cell selection and editing
  selectedCell: CellPosition | null;
  editingCell: CellPosition | null;
  copiedContent: string | null;
  contextMenu: ContextMenuState;
  
  // Actions
  loadData: () => Promise<void>;
  handleAddProject: () => Promise<void>;
  handleUpdateField: (id: string, field: string, value: string) => Promise<void>;
  
  // Cell interactions
  handleCellClick: (rowIndex: number, field: string, e: React.MouseEvent) => void;
  handleCellDoubleClick: (rowIndex: number, field: string) => void;
  handleSaveEdit: (rowIndex: number, field: string, value: string) => void;
  handleContextMenu: (e: React.MouseEvent) => void;
  
  // Context menu actions
  copyCell: () => void;
  pasteCell: () => void;
  cutCell: () => void;
  deleteRow: () => Promise<void>;
  duplicateRow: () => Promise<void>;
  hideContextMenu: () => void;
}

// Static data configurations
export const projectStatusOptions = [
  { value: 'not_contacted', label: 'Not Contacted', color: 'status-waiting' },
  { value: 'initial_outreach', label: 'Initial Outreach', color: 'status-waiting' },
  { value: 'qualified', label: 'Qualified', color: 'status-qualified' },
  { value: 'converted', label: 'Converted', color: 'status-converted' },
  { value: 'declined', label: 'Declined', color: 'status-declined' }
];

export const nicheColors: Record<string, string> = {
  'Health & Wellness': 'tag-green',
  'E-commerce': 'tag-blue',
  'SaaS': 'tag-purple',
  'Education': 'tag-blue',
  'Finance': 'tag-purple',
  'Real Estate': 'tag-orange',
  'Travel': 'tag-blue',
  'Gaming': 'tag-red',
  'Music': 'tag-purple',
  'Fashion': 'tag-yellow',
  'Food & Beverage': 'tag-yellow',
  'Technology': 'tag-blue',
  'Consulting': 'tag-purple',
  'Other': 'tag-orange'
};

export const affiliateNames: Record<string, string> = {
  '00000000-0000-0000-0000-000000000001': 'Nick Merson',
  '00000000-0000-0000-0000-000000000002': 'ALJ',
  '00000000-0000-0000-0000-000000000003': 'SISO',
  '00000000-0000-0000-0000-000000000004': 'IBBY',
  '00000000-0000-0000-0000-000000000005': 'Stevie',
  'placeholder-user-id': 'New Affiliate'
};

export const useAirtablePartners = (): UseAirtablePartnersReturn => {
  const [data, setData] = useState<PartnerProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);
  const [editingCell, setEditingCell] = useState<CellPosition | null>(null);
  const [copiedContent, setCopiedContent] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    x: 0,
    y: 0,
    visible: false
  });
  const { toast } = useToast();

  // Load data from Supabase
  const loadData = async () => {
    try {
      setIsLoading(true);
      const { data: projects, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the raw Supabase data to match our PartnerProject type
      const transformedData: PartnerProject[] = (projects || []).map((project: any) => ({
        id: project.id,
        title: project.title || '',
        client_name: project.client_name || '',
        live_url: project.live_url || '',
        client_source: project.client_source || '',
        user_id: project.user_id,
        project_status: project.project_status || '',
        mvp_build_status: project.mvp_build_status || '',
        notion_plan_url: project.notion_plan_url || project.notion_url || '',
        estimated_price: project.estimated_price || '',
        initial_contact_date: project.initial_contact_date || '',
        payment_status: project.payment_status || '',
        plan_confirmation_status: project.plan_confirmation_status || '',
        created_at: project.created_at,
        updated_at: project.updated_at || ''
      }));

      setData(transformedData);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load projects. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle field updates
  const handleUpdateField = async (id: string, field: string, value: string) => {
    try {
      const { error } = await supabase
        .from('portfolio_items')
        .update({ [field]: value })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Project Updated",
        description: `${field} has been updated successfully.`,
      });
      
      // Update local data immediately for better UX
      setData(prevData => 
        prevData.map(item => 
          item.id === id ? { ...item, [field]: value } : item
        )
      );
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle adding new project
  const handleAddProject = async () => {
    try {
      const newProject = {
        title: 'New Project',
        client_name: 'Other',
        live_url: 'https://example.vercel.app',
        client_source: 'Personal Network',
        project_status: 'not_contacted',
        user_id: '9d7b7e7d-a152-4f66-9af9-45d5c544faaf', // admin@sisoagency.com
        description: 'New project description',
        technologies: ['React'],
        mvp_build_status: 'Planning',
        notion_plan_url: '',
        estimated_price: '$0',
        initial_contact_date: new Date().toISOString().split('T')[0],
        payment_status: 'Not Started',
        plan_confirmation_status: 'Pending'
      };

      const { error } = await supabase
        .from('portfolio_items')
        .insert([newProject]);

      if (error) throw error;
      
      toast({
        title: "Project Added",
        description: "New project has been added successfully.",
      });
      
      // Reload data
      await loadData();
    } catch (error) {
      console.error('Error adding project:', error);
      toast({
        title: "Add Failed",
        description: "Failed to add new project. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle cell click
  const handleCellClick = (rowIndex: number, field: string, e: React.MouseEvent) => {
    if (editingCell) return;
    
    setSelectedCell({ rowIndex, field });
    
    // Remove previous selection
    document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
    const row = (e.target as HTMLElement).closest('tr');
    if (row) {
      row.classList.add('selected');
    }
  };

  // Handle cell double click
  const handleCellDoubleClick = (rowIndex: number, field: string) => {
    if (['title', 'client_name', 'live_url', 'client_source', 'project_status'].includes(field)) {
      setEditingCell({ rowIndex, field });
    }
  };

  // Handle save cell edit
  const handleSaveEdit = (rowIndex: number, field: string, value: string) => {
    const project = data[rowIndex];
    if (project) {
      handleUpdateField(project.id, field, value);
    }
    setEditingCell(null);
  };

  // Context menu functions
  const copyCell = () => {
    if (selectedCell) {
      const project = data[selectedCell.rowIndex];
      if (project) {
        const value = project[selectedCell.field as keyof PartnerProject];
        setCopiedContent(String(value || ''));
        toast({
          title: "Copied",
          description: "Cell content copied to clipboard.",
        });
      }
    }
    hideContextMenu();
  };

  const pasteCell = () => {
    if (selectedCell && copiedContent !== null) {
      const project = data[selectedCell.rowIndex];
      if (project) {
        handleUpdateField(project.id, selectedCell.field, copiedContent);
      }
    }
    hideContextMenu();
  };

  const cutCell = () => {
    copyCell();
    if (selectedCell) {
      const project = data[selectedCell.rowIndex];
      if (project) {
        handleUpdateField(project.id, selectedCell.field, '');
      }
    }
  };

  const deleteRow = async () => {
    if (selectedCell) {
      const project = data[selectedCell.rowIndex];
      if (project) {
        try {
          const { error } = await supabase
            .from('portfolio_items')
            .delete()
            .eq('id', project.id);

          if (error) throw error;
          
          toast({
            title: "Project Deleted",
            description: "Project has been deleted successfully.",
          });
          
          await loadData();
        } catch (error) {
          console.error('Error deleting project:', error);
          toast({
            title: "Delete Failed",
            description: "Failed to delete project. Please try again.",
            variant: "destructive",
          });
        }
      }
    }
    hideContextMenu();
  };

  const duplicateRow = async () => {
    if (selectedCell) {
      const project = data[selectedCell.rowIndex];
      if (project) {
        try {
          const { id, created_at, updated_at, ...projectData } = project;
          const { error } = await supabase
            .from('portfolio_items')
            .insert([{ ...projectData, title: `${projectData.title} (Copy)` }]);

          if (error) throw error;
          
          toast({
            title: "Project Duplicated",
            description: "Project has been duplicated successfully.",
          });
          
          await loadData();
        } catch (error) {
          console.error('Error duplicating project:', error);
          toast({
            title: "Duplicate Failed",
            description: "Failed to duplicate project. Please try again.",
            variant: "destructive",
          });
        }
      }
    }
    hideContextMenu();
  };

  const hideContextMenu = () => {
    setContextMenu({ x: 0, y: 0, visible: false });
  };

  // Handle context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.editable')) {
      e.preventDefault();
      setContextMenu({
        x: e.pageX,
        y: e.pageY,
        visible: true
      });
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell || editingCell) return;

      const rowIndex = selectedCell.rowIndex;
      const fields = ['title', 'client_name', 'live_url', 'client_source', 'user_id', 'project_status'];
      const fieldIndex = fields.indexOf(selectedCell.field);

      switch(e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (rowIndex > 0) {
            setSelectedCell({ rowIndex: rowIndex - 1, field: selectedCell.field });
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (rowIndex < data.length - 1) {
            setSelectedCell({ rowIndex: rowIndex + 1, field: selectedCell.field });
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (fieldIndex > 0) {
            setSelectedCell({ rowIndex, field: fields[fieldIndex - 1] });
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (fieldIndex < fields.length - 1) {
            setSelectedCell({ rowIndex, field: fields[fieldIndex + 1] });
          }
          break;
        case 'Enter':
          if (selectedCell) {
            handleCellDoubleClick(selectedCell.rowIndex, selectedCell.field);
          }
          break;
        case 'Delete':
          if (selectedCell && !editingCell) {
            const project = data[selectedCell.rowIndex];
            if (project) {
              handleUpdateField(project.id, selectedCell.field, '');
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, editingCell, data]);

  // Hide context menu on click
  useEffect(() => {
    const handleClick = () => hideContextMenu();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  return {
    // Data state
    data,
    isLoading,
    
    // Cell selection and editing
    selectedCell,
    editingCell,
    copiedContent,
    contextMenu,
    
    // Actions
    loadData,
    handleAddProject,
    handleUpdateField,
    
    // Cell interactions
    handleCellClick,
    handleCellDoubleClick,
    handleSaveEdit,
    handleContextMenu,
    
    // Context menu actions
    copyCell,
    pasteCell,
    cutCell,
    deleteRow,
    duplicateRow,
    hideContextMenu
  };
};