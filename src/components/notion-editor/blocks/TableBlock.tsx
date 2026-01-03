import React, { useState, useCallback } from 'react';
import { NotionBlock, TableColumn, TableRow } from '@/types/notion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Trash2, 
  MoreHorizontal, 
  GripVertical,
  ArrowUp,
  ArrowDown,
  Type,
  Hash,
  Calendar,
  CheckSquare,
  List
} from 'lucide-react';

interface TableBlockProps {
  block: NotionBlock;
  isEditing?: boolean;
  onContentChange?: (blockId: string, content: string) => void;
  onBlockUpdate?: (blockId: string, properties: any) => void;
}

export const TableBlock: React.FC<TableBlockProps> = ({
  block,
  isEditing = false,
  onContentChange,
  onBlockUpdate
}) => {
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string } | null>(null);
  const [newColumnName, setNewColumnName] = useState('');
  const [showColumnMenu, setShowColumnMenu] = useState<string | null>(null);

  // Initialize default table if empty
  const columns = block.properties?.columns || [
    { id: 'col1', name: 'Column 1', type: 'text' as const },
    { id: 'col2', name: 'Column 2', type: 'text' as const },
    { id: 'col3', name: 'Column 3', type: 'text' as const }
  ];

  const rows = block.properties?.rows || [
    { id: 'row1', cells: { col1: '', col2: '', col3: '' } },
    { id: 'row2', cells: { col1: '', col2: '', col3: '' } }
  ];

  const updateTable = useCallback((newColumns: TableColumn[], newRows: TableRow[]) => {
    if (onBlockUpdate) {
      onBlockUpdate(block.id, {
        ...block.properties,
        columns: newColumns,
        rows: newRows
      });
    }
  }, [block.id, block.properties, onBlockUpdate]);

  const addColumn = (type: string = 'text') => {
    const newColumn: TableColumn = {
      id: `col_${Date.now()}`,
      name: newColumnName || `Column ${columns.length + 1}`,
      type: type as any
    };
    
    const updatedRows = rows.map(row => ({
      ...row,
      cells: { ...row.cells, [newColumn.id]: '' }
    }));

    updateTable([...columns, newColumn], updatedRows);
    setNewColumnName('');
  };

  const addRow = () => {
    const newRow: TableRow = {
      id: `row_${Date.now()}`,
      cells: columns.reduce((acc, col) => ({ ...acc, [col.id]: '' }), {})
    };
    
    updateTable(columns, [...rows, newRow]);
  };

  const deleteColumn = (columnId: string) => {
    const updatedColumns = columns.filter(col => col.id !== columnId);
    const updatedRows = rows.map(row => {
      const newCells = { ...row.cells };
      delete newCells[columnId];
      return { ...row, cells: newCells };
    });
    
    updateTable(updatedColumns, updatedRows);
  };

  const deleteRow = (rowId: string) => {
    const updatedRows = rows.filter(row => row.id !== rowId);
    updateTable(columns, updatedRows);
  };

  const updateCell = (rowId: string, columnId: string, value: any) => {
    const updatedRows = rows.map(row => 
      row.id === rowId 
        ? { ...row, cells: { ...row.cells, [columnId]: value } }
        : row
    );
    
    updateTable(columns, updatedRows);
  };

  const updateColumnName = (columnId: string, newName: string) => {
    const updatedColumns = columns.map(col =>
      col.id === columnId ? { ...col, name: newName } : col
    );
    
    updateTable(updatedColumns, rows);
  };

  const getCellIcon = (type: string) => {
    switch (type) {
      case 'text': return <Type className="w-3 h-3" />;
      case 'number': return <Hash className="w-3 h-3" />;
      case 'date': return <Calendar className="w-3 h-3" />;
      case 'checkbox': return <CheckSquare className="w-3 h-3" />;
      case 'select': return <List className="w-3 h-3" />;
      default: return <Type className="w-3 h-3" />;
    }
  };

  const renderCell = (row: TableRow, column: TableColumn) => {
    const cellValue = row.cells[column.id] || '';
    const isEditing = editingCell?.rowId === row.id && editingCell?.columnId === column.id;

    if (!isEditing && !isEditing) {
      return (
        <div
          className="min-h-[32px] px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center"
          onClick={() => isEditing && setEditingCell({ rowId: row.id, columnId: column.id })}
        >
          {column.type === 'checkbox' ? (
            <Checkbox 
              checked={cellValue === true} 
              onCheckedChange={(checked) => isEditing && updateCell(row.id, column.id, checked)}
            />
          ) : (
            <span className="text-gray-900 dark:text-gray-100 text-sm">
              {cellValue || (isEditing ? '' : '—')}
            </span>
          )}
        </div>
      );
    }

    switch (column.type) {
      case 'checkbox':
        return (
          <div className="px-3 py-2">
            <Checkbox 
              checked={cellValue === true} 
              onCheckedChange={(checked) => updateCell(row.id, column.id, checked)}
            />
          </div>
        );
      
      case 'select':
        return (
          <div className="px-1 py-1">
            <Select value={cellValue} onValueChange={(value) => updateCell(row.id, column.id, value)}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {(column.options || ['Option 1', 'Option 2', 'Option 3']).map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
        
      default:
        return (
          <Input
            value={cellValue}
            onChange={(e) => updateCell(row.id, column.id, e.target.value)}
            onBlur={() => setEditingCell(null)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === 'Escape') {
                setEditingCell(null);
              }
            }}
            className="h-8 text-sm border-none shadow-none focus:ring-1 focus:ring-blue-500"
            autoFocus
            type={column.type === 'number' ? 'number' : 'text'}
          />
        );
    }
  };

  return (
    <div className="notion-table-block my-4">
      <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
        {/* Table Header */}
        <div className="border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex">
            {columns.map((column, index) => (
              <div 
                key={column.id} 
                className="flex-1 min-w-[120px] border-r border-gray-300 dark:border-gray-700 last:border-r-0"
              >
                <div className="flex items-center justify-between p-2">
                  <div className="flex items-center space-x-2 flex-1">
                    {getCellIcon(column.type)}
                    {isEditing ? (
                      <Input
                        value={column.name}
                        onChange={(e) => updateColumnName(column.id, e.target.value)}
                        className="h-6 text-sm font-medium border-none shadow-none p-0"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {column.name}
                      </span>
                    )}
                  </div>
                  
                  {isEditing && (
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowColumnMenu(showColumnMenu === column.id ? null : column.id)}
                        className="h-6 w-6 p-0"
                      >
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                      
                      {showColumnMenu === column.id && (
                        <div className="absolute z-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg p-2 mt-8">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteColumn(column.id)}
                            className="text-red-600 hover:text-red-700 text-xs"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isEditing && (
              <div className="min-w-[100px] p-2 border-l border-gray-300 dark:border-gray-700">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addColumn()}
                  className="h-6 text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Column
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Table Body */}
        <div>
          {rows.map((row) => (
            <div key={row.id} className="flex border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
              {columns.map((column) => (
                <div 
                  key={`${row.id}-${column.id}`}
                  className="flex-1 min-w-[120px] border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                >
                  {renderCell(row, column)}
                </div>
              ))}
              
              {isEditing && (
                <div className="min-w-[100px] p-2 border-l border-gray-200 dark:border-gray-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteRow(row.id)}
                    className="h-6 text-xs text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Row Button */}
        {isEditing && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={addRow}
              className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Row
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}; 