import React from 'react';

/**
 * TableToolbar Component
 * 
 * Provides action buttons for the AirtablePartnersTable.
 * Includes Add Record, Automations, Filter, Sort, and Hide fields functionality.
 * 
 * Extracted from AirtablePartnersTable.tsx (1,196 lines → focused component)
 */

interface TableToolbarProps {
  onAddRecord: () => void;
  onAutomations?: () => void;
  onFilter?: () => void;
  onSort?: () => void;
  onHideFields?: () => void;
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
  onAddRecord,
  onAutomations,
  onFilter,
  onSort,
  onHideFields
}) => {
  return (
    <div className="toolbar">
      <button onClick={onAddRecord}>
        <span>+</span> Add Record
      </button>
      <button onClick={onAutomations}>
        <span>⚡</span> Automations
      </button>
      <button onClick={onFilter}>
        <span>🔍</span> Filter
      </button>
      <button onClick={onSort}>
        <span>↕️</span> Sort
      </button>
      <button onClick={onHideFields}>
        <span>👁️</span> Hide fields
      </button>
    </div>
  );
};

export default TableToolbar;