import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/shared/lib/utils";
import { useToast } from "@/shared/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Types based on Supabase portfolio_items table
type PartnerProject = {
  id: string;
  title: string; // Project Name
  client_name: string | null; // Company Niche
  live_url: string | null; // Development URL
  client_source: string | null; // Source
  user_id: string; // Affiliate (we'll map this to user names)
  project_status: string | null; // Onboarding Step
  mvp_build_status: string | null; // MVP Build Status
  notion_plan_url: string | null; // Notion Plan URL
  estimated_price: string | null; // Estimated Price
  initial_contact_date: string | null; // Initial Contact Date
  payment_status: string | null; // Payment Status
  plan_confirmation_status: string | null; // Plan Confirmation Status
  created_at: string;
  updated_at?: string;
};

// Enhanced status options for project lifecycle
const projectStatusOptions = [
  { value: 'not_contacted', label: 'Not contacted', color: 'status-waiting' },
  { value: 'contacted', label: 'Contacted', color: 'status-qualified' },
  { value: 'waiting_client', label: 'Waiting on client', color: 'status-waiting' },
  { value: 'feedback_app', label: 'Feedback from app', color: 'status-converted' },
  { value: 'declined', label: 'Declined', color: 'status-declined' }
];

// Niche/Company type colors
const nicheColors: Record<string, string> = {
  'Gym': 'tag-green',
  'Construction': 'tag-orange', 
  'Web3 Trading': 'tag-purple',
  'Restaurant': 'tag-yellow',
  'MMA GYM': 'tag-red',
  'App': 'tag-blue',
  'Self Defense Course': 'tag-red',
  'Car hire': 'tag-yellow',
  'Saas': 'tag-purple',
  'Agency': 'tag-blue',
  'Football player marketplace': 'tag-green',
  'Barbershop': 'tag-yellow',
  'E-commerce': 'tag-orange',
  'Healthcare': 'tag-green',
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

// User ID to affiliate name mapping
const affiliateNames: Record<string, string> = {
  '00000000-0000-0000-0000-000000000001': 'Nick Merson',
  '00000000-0000-0000-0000-000000000002': 'ALJ',
  '00000000-0000-0000-0000-000000000003': 'SISO',
  '00000000-0000-0000-0000-000000000004': 'IBBY',
  '00000000-0000-0000-0000-000000000005': 'Stevie',
  'placeholder-user-id': 'New Affiliate'
};

interface EditableCellProps {
  value: string;
  onSave: (value: string) => void;
  type?: 'text' | 'select' | 'url';
  options?: { value: string; label: string; color?: string }[];
  isUrl?: boolean;
}

function EditableCell({ value, onSave, type = 'text', options, isUrl }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  useEffect(() => {
    if (isEditing) {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      } else if (selectRef.current) {
        selectRef.current.focus();
      }
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <div className="relative">
        {type === 'select' && options ? (
          <select
            ref={selectRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="cell-editor"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="cell-editor"
          />
        )}
      </div>
    );
  }

  if (isUrl && value) {
    return (
      <a 
        href={value} 
        target="_blank" 
        rel="noopener noreferrer"
        className="url-cell"
        onClick={(e) => e.stopPropagation()}
      >
        {value}
      </a>
    );
  }

  if (type === 'select' && options) {
    const option = options.find(opt => opt.value === value);
    if (option) {
      return (
        <span className={`status-tag ${option.color || 'status-waiting'}`}>
          {option.label}
        </span>
      );
    }
  }

  return <span>{value}</span>;
}

export function AirtablePartnersTable() {
  const [data, setData] = useState<PartnerProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState<{ rowIndex: number; field: string } | null>(null);
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; field: string } | null>(null);
  const [copiedContent, setCopiedContent] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean }>({
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

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

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

  if (isLoading) {
    return (
      <div className="airtable-container">
        <div className="toolbar">
          <button className="loading">Loading...</button>
        </div>
        <div className="table-wrapper">
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            Loading projects...
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Inject the custom CSS styles */}
      <style>{`
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        .airtable-container {
            background: #111111;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            overflow: hidden;
            border: 1px solid #222;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            font-size: 13px;
        }

        .toolbar {
            background: #1a1a1a;
            border-bottom: 1px solid #333;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .toolbar button {
            background: #ff6b35;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 13px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            font-weight: 500;
            transition: all 0.2s;
        }

        .toolbar button:hover {
            background: #ff5722;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(255, 107, 53, 0.3);
        }

        .toolbar button:active {
            transform: translateY(0);
        }

                 .table-wrapper {
             overflow: auto;
             max-height: 70vh;
             position: relative;
             background: #0a0a0a;
             scroll-behavior: smooth;
             -webkit-overflow-scrolling: touch;
         }

         /* Custom scrollbar styling */
         .table-wrapper::-webkit-scrollbar {
             width: 12px;
             height: 12px;
         }

         .table-wrapper::-webkit-scrollbar-track {
             background: #1a1a1a;
             border-radius: 6px;
         }

         .table-wrapper::-webkit-scrollbar-thumb {
             background: #ff6b35;
             border-radius: 6px;
             border: 2px solid #1a1a1a;
         }

         .table-wrapper::-webkit-scrollbar-thumb:hover {
             background: #ff5722;
         }

         .table-wrapper::-webkit-scrollbar-corner {
             background: #1a1a1a;
         }

                 table {
             width: 100%;
             border-collapse: collapse;
             table-layout: fixed;
             position: relative;
             min-width: 2000px;
         }

        th {
            background: #1a1a1a;
            border: 1px solid #333;
            padding: 10px 12px;
            text-align: left;
            font-weight: 600;
            position: sticky;
            top: 0;
            z-index: 10;
            user-select: none;
            cursor: pointer;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: #fff;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        th:hover {
            background: #222;
        }

        .header-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .column-icon {
            margin-right: 6px;
            opacity: 0.8;
            color: #ff6b35;
        }

        .dropdown-arrow {
            opacity: 0;
            transition: opacity 0.2s;
            color: #ff6b35;
        }

        th:hover .dropdown-arrow {
            opacity: 0.8;
        }

        .row-number {
            background: #1a1a1a;
            border: 1px solid #333;
            text-align: center;
            color: #666;
            font-size: 11px;
            width: 40px;
            position: sticky;
            left: 0;
            z-index: 5;
        }

        td.row-number {
            background: #1a1a1a;
            border-right: 2px solid #333;
        }

        td {
            border: 1px solid #222;
            padding: 10px 12px;
            position: relative;
            background: #111;
            cursor: text;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: #e0e0e0;
            transition: all 0.2s;
        }

        td:hover {
            box-shadow: inset 0 0 0 2px #ff6b35;
            z-index: 1;
            background: #1a1a1a;
        }

        .cell-tag {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 16px;
            font-size: 11px;
            font-weight: 600;
            margin-right: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .tag-blue { background: #1a3a52; color: #4a9eff; border: 1px solid #2a4a62; }
        .tag-green { background: #1a4a2a; color: #4aff6a; border: 1px solid #2a5a3a; }
        .tag-yellow { background: #4a3a1a; color: #ffda4a; border: 1px solid #5a4a2a; }
        .tag-red { background: #4a1a1a; color: #ff4a4a; border: 1px solid #5a2a2a; }
        .tag-purple { background: #3a1a4a; color: #da4aff; border: 1px solid #4a2a5a; }
        .tag-orange { background: #4a2a1a; color: #ff6b35; border: 1px solid #5a3a2a; }

        .status-tag {
            display: inline-flex;
            align-items: center;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: capitalize;
        }

        .status-qualified { background: #1a4a2a; color: #4aff6a; border: 1px solid #2a5a3a; }
        .status-converted { background: #1a3a52; color: #4a9eff; border: 1px solid #2a4a62; }
        .status-waiting { background: rgba(255, 107, 53, 0.2); color: #ff6b35; border: 1px solid #ff6b35; }
        .status-declined { background: #4a1a1a; color: #ff4a4a; border: 1px solid #5a2a2a; }

        tr:hover td {
            background: #1a1a1a;
        }

        tr.selected td {
            background: rgba(255, 107, 53, 0.1);
            border-color: #333;
        }

        .add-row {
            border: 2px dashed #333;
            background: #0a0a0a;
            padding: 12px 16px;
            text-align: left;
            cursor: pointer;
            color: #666;
            width: 100%;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
            font-weight: 500;
        }

        .add-row:hover {
            background: #1a1a1a;
            color: #ff6b35;
            border-color: #ff6b35;
        }

        .context-menu {
            position: absolute;
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            padding: 4px 0;
            z-index: 1000;
            display: none;
        }

        .context-menu.visible {
            display: block;
        }

        .context-menu-item {
            padding: 10px 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            color: #e0e0e0;
            transition: all 0.2s;
        }

        .context-menu-item:hover {
            background: #ff6b35;
            color: #fff;
        }

        .cell-editor {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border: 2px solid #ff6b35;
            background: #1a1a1a;
            padding: 8px 10px;
            font-family: inherit;
            font-size: inherit;
            z-index: 100;
            box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
            color: #fff;
            outline: none;
        }

        .url-cell {
            color: #ff6b35;
            text-decoration: none;
        }

        .url-cell:hover {
            text-decoration: underline;
        }

        .table-wrapper::-webkit-scrollbar {
            width: 10px;
            height: 10px;
        }

        .table-wrapper::-webkit-scrollbar-track {
            background: #0a0a0a;
        }

        .table-wrapper::-webkit-scrollbar-thumb {
            background: #333;
            border-radius: 5px;
        }

        .table-wrapper::-webkit-scrollbar-thumb:hover {
            background: #ff6b35;
        }

        @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
        }

        .loading {
            animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>

      <div className="airtable-container">
        <div className="toolbar">
          <button onClick={handleAddProject}>
            <span>+</span> Add Record
          </button>
          <button>
            <span>⚡</span> Automations
          </button>
          <button>
            <span>🔍</span> Filter
          </button>
          <button>
            <span>↕️</span> Sort
          </button>
          <button>
            <span>👁️</span> Hide fields
          </button>
        </div>

        <div className="table-wrapper">
          <table id="airtableSheet">
            <thead>
              <tr>
                <th className="row-number">#</th>
                <th style={{ width: '200px' }}>
                  <div className="header-content">
                    <span>
                      <span className="column-icon">📝</span>
                      Project Name
                    </span>
                    <span className="dropdown-arrow">▼</span>
                  </div>
                </th>
                <th style={{ width: '150px' }}>
                  <div className="header-content">
                    <span>
                      <span className="column-icon">🏢</span>
                      Company Niche
                    </span>
                    <span className="dropdown-arrow">▼</span>
                  </div>
                </th>
                <th style={{ width: '250px' }}>
                  <div className="header-content">
                    <span>
                      <span className="column-icon">🔗</span>
                      Development URL
                    </span>
                    <span className="dropdown-arrow">▼</span>
                  </div>
                </th>
                <th style={{ width: '150px' }}>
                  <div className="header-content">
                    <span>
                      <span className="column-icon">📍</span>
                      Source
                    </span>
                    <span className="dropdown-arrow">▼</span>
                  </div>
                </th>
                <th style={{ width: '120px' }}>
                  <div className="header-content">
                    <span>
                      <span className="column-icon">👤</span>
                      Affiliate
                    </span>
                    <span className="dropdown-arrow">▼</span>
                  </div>
                </th>
                <th style={{ width: '180px' }}>
                  <div className="header-content">
                    <span>
                      <span className="column-icon">📋</span>
                      Onboarding Step
                    </span>
                    <span className="dropdown-arrow">▼</span>
                  </div>
                </th>
                <th style={{ width: '150px' }}>
                  <div className="header-content">
                    <span>
                      <span className="column-icon">🚀</span>
                      MVP Build Status
                    </span>
                    <span className="dropdown-arrow">▼</span>
                  </div>
                </th>
                <th style={{ width: '250px' }}>
                  <div className="header-content">
                    <span>
                      <span className="column-icon">📄</span>
                      Notion Plan URL
                    </span>
                    <span className="dropdown-arrow">▼</span>
                  </div>
                </th>
                <th style={{ width: '120px' }}>
                  <div className="header-content">
                    <span>
                      <span className="column-icon">💰</span>
                      Estimated Price
                    </span>
                    <span className="dropdown-arrow">▼</span>
                  </div>
                </th>
                <th style={{ width: '150px' }}>
                  <div className="header-content">
                    <span>
                      <span className="column-icon">📅</span>
                      Initial Contact Date
                    </span>
                    <span className="dropdown-arrow">▼</span>
                  </div>
                </th>
                <th style={{ width: '140px' }}>
                  <div className="header-content">
                    <span>
                      <span className="column-icon">💳</span>
                      Payment Status
                    </span>
                    <span className="dropdown-arrow">▼</span>
                  </div>
                </th>
                <th style={{ width: '150px' }}>
                  <div className="header-content">
                    <span>
                      <span className="column-icon">✅</span>
                      Plan Confirmation
                    </span>
                    <span className="dropdown-arrow">▼</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody id="tableBody">
              {data.map((project, index) => (
                <tr key={project.id}>
                  <td className="row-number">{index + 1}</td>
                  <td 
                    className="editable" 
                    onClick={(e) => handleCellClick(index, 'title', e)}
                    onDoubleClick={() => handleCellDoubleClick(index, 'title')}
                    onContextMenu={handleContextMenu}
                  >
                    {editingCell?.rowIndex === index && editingCell?.field === 'title' ? (
                      <EditableCell
                        value={project.title}
                        onSave={(value) => handleSaveEdit(index, 'title', value)}
                      />
                    ) : (
                      project.title
                    )}
                  </td>
                  <td 
                    className="editable" 
                    onClick={(e) => handleCellClick(index, 'client_name', e)}
                    onDoubleClick={() => handleCellDoubleClick(index, 'client_name')}
                    onContextMenu={handleContextMenu}
                  >
                    {editingCell?.rowIndex === index && editingCell?.field === 'client_name' ? (
                      <EditableCell
                        value={project.client_name || ''}
                        onSave={(value) => handleSaveEdit(index, 'client_name', value)}
                      />
                    ) : (
                      <span className={`cell-tag ${nicheColors[project.client_name || ''] || 'tag-orange'}`}>
                        {project.client_name}
                      </span>
                    )}
                  </td>
                  <td 
                    className="editable" 
                    onClick={(e) => handleCellClick(index, 'live_url', e)}
                    onDoubleClick={() => handleCellDoubleClick(index, 'live_url')}
                    onContextMenu={handleContextMenu}
                  >
                    {editingCell?.rowIndex === index && editingCell?.field === 'live_url' ? (
                      <EditableCell
                        value={project.live_url || ''}
                        onSave={(value) => handleSaveEdit(index, 'live_url', value)}
                        type="url"
                      />
                    ) : (
                      <EditableCell
                        value={project.live_url || ''}
                        onSave={() => {}}
                        isUrl={true}
                      />
                    )}
                  </td>
                  <td 
                    className="editable" 
                    onClick={(e) => handleCellClick(index, 'client_source', e)}
                    onDoubleClick={() => handleCellDoubleClick(index, 'client_source')}
                    onContextMenu={handleContextMenu}
                  >
                    {editingCell?.rowIndex === index && editingCell?.field === 'client_source' ? (
                      <EditableCell
                        value={project.client_source || ''}
                        onSave={(value) => handleSaveEdit(index, 'client_source', value)}
                      />
                    ) : (
                      project.client_source
                    )}
                  </td>
                  <td 
                    className="editable" 
                    onClick={(e) => handleCellClick(index, 'user_id', e)}
                    onContextMenu={handleContextMenu}
                  >
                    {affiliateNames[project.user_id] || project.user_id}
                  </td>
                  <td 
                    className="editable" 
                    onClick={(e) => handleCellClick(index, 'project_status', e)}
                    onDoubleClick={() => handleCellDoubleClick(index, 'project_status')}
                    onContextMenu={handleContextMenu}
                  >
                    {editingCell?.rowIndex === index && editingCell?.field === 'project_status' ? (
                      <EditableCell
                        value={project.project_status || ''}
                        onSave={(value) => handleSaveEdit(index, 'project_status', value)}
                        type="select"
                        options={projectStatusOptions}
                      />
                    ) : (
                      <EditableCell
                        value={project.project_status || ''}
                        onSave={() => {}}
                        type="select"
                        options={projectStatusOptions}
                      />
                    )}
                  </td>
                  <td 
                    className="editable" 
                    onClick={(e) => handleCellClick(index, 'mvp_build_status', e)}
                    onContextMenu={handleContextMenu}
                  >
                    <span className={`status-tag ${project.mvp_build_status === 'Completed' ? 'tag-green' : project.mvp_build_status === 'In Progress' ? 'tag-blue' : 'tag-orange'}`}>
                      {project.mvp_build_status || 'Not Started'}
                    </span>
                  </td>
                  <td 
                    className="editable" 
                    onClick={(e) => handleCellClick(index, 'notion_plan_url', e)}
                    onContextMenu={handleContextMenu}
                  >
                    {project.notion_plan_url ? (
                      <a href={project.notion_plan_url} target="_blank" rel="noopener noreferrer" style={{ color: '#ff6b35', textDecoration: 'none' }}>
                        📄 Notion Plan
                      </a>
                    ) : (
                      <span style={{ color: '#666' }}>No plan</span>
                    )}
                  </td>
                  <td 
                    className="editable" 
                    onClick={(e) => handleCellClick(index, 'estimated_price', e)}
                    onContextMenu={handleContextMenu}
                  >
                    <span style={{ color: project.estimated_price && project.estimated_price !== '£0.00' ? '#4aff6a' : '#666', fontWeight: '600' }}>
                      {project.estimated_price || '—'}
                    </span>
                  </td>
                  <td 
                    className="editable" 
                    onClick={(e) => handleCellClick(index, 'initial_contact_date', e)}
                    onContextMenu={handleContextMenu}
                  >
                    <span style={{ color: project.initial_contact_date ? '#e0e0e0' : '#666' }}>
                      {project.initial_contact_date || '—'}
                    </span>
                  </td>
                  <td 
                    className="editable" 
                    onClick={(e) => handleCellClick(index, 'payment_status', e)}
                    onContextMenu={handleContextMenu}
                  >
                    <span className={`status-tag ${project.payment_status === 'Invoiced' ? 'tag-green' : 'tag-orange'}`}>
                      {project.payment_status || 'Not Invoiced'}
                    </span>
                  </td>
                  <td 
                    className="editable" 
                    onClick={(e) => handleCellClick(index, 'plan_confirmation_status', e)}
                    onContextMenu={handleContextMenu}
                  >
                    <span className={`status-tag ${
                      project.plan_confirmation_status === 'Confirmed' ? 'tag-green' : 
                      project.plan_confirmation_status === 'Declined' ? 'tag-red' : 
                      'tag-yellow'
                    }`}>
                      {project.plan_confirmation_status || 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="add-row" onClick={handleAddProject}>
            <span>+</span> Add a record
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <div 
          className="context-menu visible" 
          style={{ 
            left: contextMenu.x, 
            top: contextMenu.y,
            position: 'fixed'
          }}
        >
          <div className="context-menu-item" onClick={copyCell}>
            <span>📋</span> Copy
          </div>
          <div className="context-menu-item" onClick={cutCell}>
            <span>✂️</span> Cut
          </div>
          <div className="context-menu-item" onClick={pasteCell}>
            <span>📌</span> Paste
          </div>
          <div className="context-menu-item" onClick={deleteRow}>
            <span>🗑️</span> Delete Row
          </div>
          <div className="context-menu-item" onClick={duplicateRow}>
            <span>📑</span> Duplicate Row
          </div>
        </div>
      )}
    </>
  );
}