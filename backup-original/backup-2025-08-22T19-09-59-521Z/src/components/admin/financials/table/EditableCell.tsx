
import React, { useState, useRef, useEffect } from 'react';
import { TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface EditableCellProps {
  value: string | number;
  onChange: (value: string | number) => void;
  onComplete?: () => void;
  type?: 'text' | 'number' | 'currency' | 'date' | 'select';
  options?: Array<{ value: string; label: string }>;
  className?: string;
  align?: "left" | "center" | "right";
  formatter?: (value: any) => React.ReactNode;
  inputClassName?: string;
  style?: React.CSSProperties; // Add style prop to the interface
}

export function EditableCell({
  value,
  onChange,
  onComplete,
  type = 'text',
  options = [],
  className,
  align = 'left',
  formatter = (v) => String(v),
  inputClassName,
  style, // Add style to the destructuring
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      
      // Select all text if it's not a number input
      if (type !== 'number') {
        inputRef.current.select();
      }
    }
  }, [isEditing, type]);

  const handleDoubleClick = () => {
    setEditValue(value);
    setIsEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      commitChange();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    commitChange();
  };

  const commitChange = () => {
    if (value !== editValue) {
      onChange(editValue);
    }
    setIsEditing(false);
    onComplete?.();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const newValue = type === 'number' || type === 'currency' 
      ? parseFloat(e.target.value) || 0 
      : e.target.value;
    
    setEditValue(newValue);
  };

  const formattedValue = (() => {
    if (type === 'currency' && typeof value === 'number') {
      return `£${value.toFixed(2)}`;
    }
    
    return formatter(value);
  })();

  return (
    <TableCell 
      className={cn(
        "cell-editable relative border-r border-border/10 transition-all",
        isEditing ? "p-0 z-20" : "cursor-cell hover:bg-blue-50/10",
        className
      )} 
      align={align}
      onDoubleClick={handleDoubleClick}
      data-editing={isEditing ? "true" : undefined}
      style={style} // Apply the style prop
    >
      {isEditing ? (
        <div className="flex items-stretch w-full h-full">
          {type === 'select' ? (
            <select
              value={String(editValue)}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className={cn(
                "w-full h-full px-3 py-2 focus:outline-none focus:ring-0 border-0 bg-white dark:bg-gray-800",
                inputClassName
              )}
            >
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <Input
              ref={inputRef}
              type={type === 'currency' ? 'number' : type}
              value={typeof editValue === 'number' && type === 'currency' ? editValue.toString() : editValue}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              step={type === 'currency' ? '0.01' : undefined}
              className={cn(
                "border-0 shadow-none focus:ring-0 h-full rounded-none",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "bg-blue-50/30 dark:bg-blue-900/20",
                inputClassName
              )}
            />
          )}
          
          <div className="flex items-center border-l border-border/20 bg-background">
            <button 
              onClick={commitChange}
              className="p-1.5 hover:bg-green-50 hover:dark:bg-green-900/20 text-green-600"
            >
              <Check className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setIsEditing(false)}
              className="p-1.5 hover:bg-red-50 hover:dark:bg-red-900/20 text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="px-3 py-2.5">{formattedValue}</div>
      )}
    </TableCell>
  );
}
