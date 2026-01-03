import React from 'react';

/**
 * ContextMenu Component
 * 
 * Provides right-click context menu functionality for table cells.
 * Includes Copy, Cut, Paste, Delete Row, and Duplicate Row actions.
 * 
 * Extracted from AirtablePartnersTable.tsx (1,196 lines → focused component)
 */

interface ContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onDeleteRow: () => void;
  onDuplicateRow: () => void;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  visible,
  x,
  y,
  onCopy,
  onCut,
  onPaste,
  onDeleteRow,
  onDuplicateRow,
  onClose
}) => {
  if (!visible) return null;

  return (
    <div 
      className="context-menu visible" 
      style={{ 
        left: x, 
        top: y,
        position: 'fixed'
      }}
    >
      <div className="context-menu-item" onClick={onCopy}>
        <span>📋</span> Copy
      </div>
      <div className="context-menu-item" onClick={onCut}>
        <span>✂️</span> Cut
      </div>
      <div className="context-menu-item" onClick={onPaste}>
        <span>📌</span> Paste
      </div>
      <div className="context-menu-item" onClick={onDeleteRow}>
        <span>🗑️</span> Delete Row
      </div>
      <div className="context-menu-item" onClick={onDuplicateRow}>
        <span>📑</span> Duplicate Row
      </div>
    </div>
  );
};

export default ContextMenu;