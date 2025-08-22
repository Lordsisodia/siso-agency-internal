import React from 'react';
import { Input } from '@/components/ui/input';
import { ClientData } from '@/types/client.types';
import { BasicCell } from './table-cells/BasicCell';
import { StatusCell } from './table-cells/StatusCell';
import { TodosCell } from './table-cells/TodosCell';
import { LinkCell } from './table-cells/LinkCell';
import { DateCell } from './table-cells/DateCell';
import { DollarSign } from 'lucide-react';
import { ProgressCell } from './table-cells/ProgressCell';

interface ClientTableCellProps {
  client: ClientData;
  columnKey: string;
  isEditing: boolean;
  editValue: string;
  editInputRef: React.RefObject<HTMLInputElement>;
  onEditValueChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onDoubleClick: () => void;
  onSaveEdit: (params: { id: string; field: string; value: string }) => void;
}

export function ClientTableCell({
  client,
  columnKey,
  isEditing,
  editValue,
  editInputRef,
  onEditValueChange,
  onKeyDown,
  onDoubleClick,
}: ClientTableCellProps) {
  if (isEditing) {
    return (
      <Input
        ref={editInputRef}
        value={editValue}
        onChange={(e) => onEditValueChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="h-8 min-w-[120px] border-border/50"
        autoFocus
      />
    );
  }

  const renderContent = () => {
    switch (columnKey) {
      case 'business_name':
        return (
          <div className="flex flex-col space-y-0.5" title={client.business_name || ''} onDoubleClick={onDoubleClick}>
            <span className="font-medium text-gray-100">{client.business_name || 'Unknown Business'}</span>
          </div>
        );

      case 'progress':
        return <ProgressCell progress={client.progress || 'Not Started'} />;

      case 'status':
        return <StatusCell status={client.status} />;

      case 'todos':
        return <TodosCell todos={client.todos} />;

      case 'notion_plan_url':
        return <LinkCell url={client.notion_plan_url} label="Notion Plan" icon="file" />;

      case 'development_url':
        return <LinkCell url={client.development_url} label="View Site" />;

      case 'estimated_price':
        if (!client.estimated_price) return <span className="text-gray-400">-</span>;
        return (
          <span className="flex items-center text-gray-200">
            <DollarSign className="h-4 w-4" />
            {client.estimated_price.toLocaleString()}
          </span>
        );

      case 'updated_at':
      case 'initial_contact_date':
      case 'start_date':
      case 'estimated_completion_date':
        return (
          <DateCell 
            date={client[columnKey]} 
            showIcon={columnKey === 'estimated_completion_date'} 
          />
        );

      case 'next_steps':
      case 'key_research':
        return (
          <div className="max-w-xs truncate" title={client[columnKey]?.toString() || ''} onDoubleClick={onDoubleClick}>
            <BasicCell value={client[columnKey]} />
          </div>
        );

      default:
        return (
          <div onDoubleClick={onDoubleClick}>
            <BasicCell value={client[columnKey as keyof ClientData]} />
          </div>
        );
    }
  };

  return renderContent();
}

// Export TableCell separately as it's a different component
export { TableCell } from '@/components/ui/table';
