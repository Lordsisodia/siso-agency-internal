import React from 'react';
import EditableCell from './EditableCell';

/**
 * TableRow Component
 * 
 * Renders individual table rows with editable cells and click handlers.
 * Handles cell editing state and context menu integration.
 * 
 * Extracted from AirtablePartnersTable.tsx (1,196 lines → focused component)
 */

export interface PartnerProject {
  id: string;
  title: string;
  client_name: string;
  live_url: string;
  client_source: string;
  user_id: string;
  project_status: string;
  mvp_build_status: string;
  notion_plan_url: string;
  estimated_price: string;
  initial_contact_date: string;
  payment_status: string;
  plan_confirmation_status: string;
  created_at: string;
  updated_at: string;
}

interface TableRowProps {
  project: PartnerProject;
  index: number;
  editingCell: { rowIndex: number; field: string } | null;
  onCellClick: (rowIndex: number, field: string, e: React.MouseEvent) => void;
  onCellDoubleClick: (rowIndex: number, field: string) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onSaveEdit: (rowIndex: number, field: string, value: string) => void;
  nicheColors: Record<string, string>;
  projectStatusOptions: { value: string; label: string; color?: string }[];
  affiliateNames: Record<string, string>;
}

export const TableRow: React.FC<TableRowProps> = ({
  project,
  index,
  editingCell,
  onCellClick,
  onCellDoubleClick,
  onContextMenu,
  onSaveEdit,
  nicheColors,
  projectStatusOptions,
  affiliateNames
}) => {
  const isEditing = (field: string) => 
    editingCell?.rowIndex === index && editingCell?.field === field;

  return (
    <tr key={project.id}>
      <td className="row-number">{index + 1}</td>
      
      {/* Project Title */}
      <td 
        className="editable" 
        onClick={(e) => onCellClick(index, 'title', e)}
        onDoubleClick={() => onCellDoubleClick(index, 'title')}
        onContextMenu={onContextMenu}
      >
        <EditableCell
          value={project.title}
          onSave={(value) => onSaveEdit(index, 'title', value)}
          isEditing={isEditing('title')}
        />
      </td>

      {/* Client Name / Company Niche */}
      <td 
        className="editable" 
        onClick={(e) => onCellClick(index, 'client_name', e)}
        onDoubleClick={() => onCellDoubleClick(index, 'client_name')}
        onContextMenu={onContextMenu}
      >
        {isEditing('client_name') ? (
          <EditableCell
            value={project.client_name || ''}
            onSave={(value) => onSaveEdit(index, 'client_name', value)}
            isEditing={true}
          />
        ) : (
          <span className={`cell-tag ${nicheColors[project.client_name || ''] || 'tag-orange'}`}>
            {project.client_name}
          </span>
        )}
      </td>

      {/* Live URL */}
      <td 
        className="editable" 
        onClick={(e) => onCellClick(index, 'live_url', e)}
        onDoubleClick={() => onCellDoubleClick(index, 'live_url')}
        onContextMenu={onContextMenu}
      >
        <EditableCell
          value={project.live_url || ''}
          onSave={(value) => onSaveEdit(index, 'live_url', value)}
          type="url"
          isUrl={!isEditing('live_url')}
          isEditing={isEditing('live_url')}
        />
      </td>

      {/* Client Source */}
      <td 
        className="editable" 
        onClick={(e) => onCellClick(index, 'client_source', e)}
        onDoubleClick={() => onCellDoubleClick(index, 'client_source')}
        onContextMenu={onContextMenu}
      >
        <EditableCell
          value={project.client_source || ''}
          onSave={(value) => onSaveEdit(index, 'client_source', value)}
          isEditing={isEditing('client_source')}
        />
      </td>

      {/* Affiliate */}
      <td 
        className="editable" 
        onClick={(e) => onCellClick(index, 'user_id', e)}
        onContextMenu={onContextMenu}
      >
        {affiliateNames[project.user_id] || project.user_id}
      </td>

      {/* Project Status */}
      <td 
        className="editable" 
        onClick={(e) => onCellClick(index, 'project_status', e)}
        onDoubleClick={() => onCellDoubleClick(index, 'project_status')}
        onContextMenu={onContextMenu}
      >
        <EditableCell
          value={project.project_status || ''}
          onSave={(value) => onSaveEdit(index, 'project_status', value)}
          type="select"
          options={projectStatusOptions}
          isEditing={isEditing('project_status')}
        />
      </td>

      {/* MVP Build Status */}
      <td 
        className="editable" 
        onClick={(e) => onCellClick(index, 'mvp_build_status', e)}
        onContextMenu={onContextMenu}
      >
        <span className={`status-tag ${
          project.mvp_build_status === 'Completed' ? 'tag-green' : 
          project.mvp_build_status === 'In Progress' ? 'tag-blue' : 
          'tag-orange'
        }`}>
          {project.mvp_build_status || 'Not Started'}
        </span>
      </td>

      {/* Notion Plan URL */}
      <td 
        className="editable" 
        onClick={(e) => onCellClick(index, 'notion_plan_url', e)}
        onContextMenu={onContextMenu}
      >
        {project.notion_plan_url ? (
          <a 
            href={project.notion_plan_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ color: '#ff6b35', textDecoration: 'none' }}
          >
            📄 Notion Plan
          </a>
        ) : (
          <span style={{ color: '#666' }}>No plan</span>
        )}
      </td>

      {/* Estimated Price */}
      <td 
        className="editable" 
        onClick={(e) => onCellClick(index, 'estimated_price', e)}
        onContextMenu={onContextMenu}
      >
        <span style={{ 
          color: project.estimated_price && project.estimated_price !== '£0.00' ? '#4aff6a' : '#666', 
          fontWeight: '600' 
        }}>
          {project.estimated_price || '—'}
        </span>
      </td>

      {/* Initial Contact Date */}
      <td 
        className="editable" 
        onClick={(e) => onCellClick(index, 'initial_contact_date', e)}
        onContextMenu={onContextMenu}
      >
        <span style={{ color: project.initial_contact_date ? '#e0e0e0' : '#666' }}>
          {project.initial_contact_date || '—'}
        </span>
      </td>

      {/* Payment Status */}
      <td 
        className="editable" 
        onClick={(e) => onCellClick(index, 'payment_status', e)}
        onContextMenu={onContextMenu}
      >
        <span className={`status-tag ${project.payment_status === 'Invoiced' ? 'tag-green' : 'tag-orange'}`}>
          {project.payment_status || 'Not Invoiced'}
        </span>
      </td>

      {/* Plan Confirmation Status */}
      <td 
        className="editable" 
        onClick={(e) => onCellClick(index, 'plan_confirmation_status', e)}
        onContextMenu={onContextMenu}
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
  );
};

export default TableRow;