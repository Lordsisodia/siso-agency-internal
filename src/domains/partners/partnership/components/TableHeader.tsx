import React from 'react';

/**
 * TableHeader Component
 * 
 * Renders the table header with column definitions, icons, and sorting indicators.
 * Handles column widths and header click events.
 * 
 * Extracted from AirtablePartnersTable.tsx (1,196 lines → focused component)
 */

interface ColumnConfig {
  key: string;
  label: string;
  icon: string;
  width: string;
  sortable?: boolean;
}

interface TableHeaderProps {
  columns: ColumnConfig[];
  onColumnClick?: (columnKey: string) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}

const defaultColumns: ColumnConfig[] = [
  { key: 'title', label: 'Project Name', icon: '📝', width: '200px' },
  { key: 'client_name', label: 'Company Niche', icon: '🏢', width: '150px' },
  { key: 'live_url', label: 'Development URL', icon: '🔗', width: '250px' },
  { key: 'client_source', label: 'Source', icon: '📍', width: '150px' },
  { key: 'user_id', label: 'Affiliate', icon: '👤', width: '120px' },
  { key: 'project_status', label: 'Onboarding Step', icon: '📋', width: '180px' },
  { key: 'mvp_build_status', label: 'MVP Build Status', icon: '🚀', width: '150px' },
  { key: 'notion_plan_url', label: 'Notion Plan URL', icon: '📄', width: '250px' },
  { key: 'estimated_price', label: 'Estimated Price', icon: '💰', width: '120px' },
  { key: 'initial_contact_date', label: 'Initial Contact Date', icon: '📅', width: '150px' },
  { key: 'payment_status', label: 'Payment Status', icon: '💳', width: '140px' },
  { key: 'plan_confirmation_status', label: 'Plan Confirmation', icon: '✅', width: '150px' }
];

export const TableHeader: React.FC<TableHeaderProps> = ({
  columns = defaultColumns,
  onColumnClick,
  sortColumn,
  sortDirection
}) => {
  const handleColumnClick = (columnKey: string) => {
    onColumnClick?.(columnKey);
  };

  return (
    <thead>
      <tr>
        <th className="row-number">#</th>
        {columns.map((column) => (
          <th 
            key={column.key}
            style={{ width: column.width }}
            onClick={() => handleColumnClick(column.key)}
          >
            <div className="header-content">
              <span>
                <span className="column-icon">{column.icon}</span>
                {column.label}
              </span>
              <span className="dropdown-arrow">
                {sortColumn === column.key && sortDirection === 'asc' && '▲'}
                {sortColumn === column.key && sortDirection === 'desc' && '▼'}
                {sortColumn !== column.key && '▼'}
              </span>
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;