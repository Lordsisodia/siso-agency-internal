import React from 'react';
import {
  TableToolbar,
  EditableCell,
  ContextMenu,
  TableHeader,
  TableRow,
  AirtableStyles,
  PartnerProject
} from '../components';
import { 
  useAirtablePartners,
  projectStatusOptions,
  nicheColors,
  affiliateNames
} from '../hooks/useAirtablePartners';

/**
 * AirtablePartnersTable - Refactored main component
 * 
 * Originally 1,196 lines, now reduced to ~150 lines (87% reduction)
 * Uses extracted components and custom hook for clean separation of concerns.
 * 
 * Components extracted:
 * - TableToolbar: Action buttons (Add, Filter, Sort, etc.)
 * - EditableCell: Inline editing functionality  
 * - ContextMenu: Right-click context menu
 * - TableHeader: Column headers with icons
 * - TableRow: Individual data rows
 * - AirtableStyles: CSS styling injection
 * - useAirtablePartners: State management hook
 */

export function AirtablePartnersTable() {
  const {
    // Data state
    data,
    isLoading,
    
    // Cell selection and editing
    selectedCell,
    editingCell,
    contextMenu,
    
    // Actions
    handleAddProject,
    
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
  } = useAirtablePartners();

  if (isLoading) {
    return (
      <>
        <AirtableStyles />
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
      </>
    );
  }

  return (
    <>
      <AirtableStyles />
      
      <div className="airtable-container">
        <TableToolbar
          onAddRecord={handleAddProject}
          onAutomations={() => console.log('Automations clicked')}
          onFilter={() => console.log('Filter clicked')}
          onSort={() => console.log('Sort clicked')}
          onHideFields={() => console.log('Hide fields clicked')}
        />

        <div className="table-wrapper">
          <table id="airtableSheet">
            <TableHeader />
            <tbody id="tableBody">
              {data.map((project, index) => (
                <TableRow
                  key={project.id}
                  project={project}
                  index={index}
                  editingCell={editingCell}
                  onCellClick={handleCellClick}
                  onCellDoubleClick={handleCellDoubleClick}
                  onContextMenu={handleContextMenu}
                  onSaveEdit={handleSaveEdit}
                  nicheColors={nicheColors}
                  projectStatusOptions={projectStatusOptions}
                  affiliateNames={affiliateNames}
                />
              ))}
            </tbody>
          </table>
          
          <div className="add-row" onClick={handleAddProject}>
            <span>+</span> Add a record
          </div>
        </div>
      </div>

      <ContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        onCopy={copyCell}
        onCut={cutCell}
        onPaste={pasteCell}
        onDeleteRow={deleteRow}
        onDuplicateRow={duplicateRow}
        onClose={hideContextMenu}
      />
    </>
  );
}