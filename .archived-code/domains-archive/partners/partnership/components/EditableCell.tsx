import React, { useState, useRef, useEffect } from 'react';

/**
 * EditableCell Component
 * 
 * Handles inline editing functionality for table cells.
 * Supports text, select, and URL types with keyboard navigation.
 * 
 * Extracted from AirtablePartnersTable.tsx (1,196 lines → focused component)
 */

interface EditableCellProps {
  value: string;
  onSave: (value: string) => void;
  type?: 'text' | 'select' | 'url';
  options?: { value: string; label: string; color?: string }[];
  isUrl?: boolean;
  isEditing?: boolean;
  onStartEdit?: () => void;
  onCancelEdit?: () => void;
}

export const EditableCell: React.FC<EditableCellProps> = ({
  value,
  onSave,
  type = 'text',
  options,
  isUrl,
  isEditing = false,
  onStartEdit,
  onCancelEdit
}) => {
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  // Update edit value when value prop changes
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    onSave(editValue);
    onCancelEdit?.();
  };

  const handleCancel = () => {
    setEditValue(value);
    onCancelEdit?.();
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
        <span 
          className={`status-tag ${option.color || 'status-waiting'}`}
          onClick={onStartEdit}
        >
          {option.label}
        </span>
      );
    }
  }

  return (
    <span onClick={onStartEdit}>
      {value}
    </span>
  );
};

export default EditableCell;