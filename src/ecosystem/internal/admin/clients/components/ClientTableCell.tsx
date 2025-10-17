import React from 'react';
import { Input } from '@/shared/ui/input';
import { ClientData } from '@/types/client.types';
import { BasicCell } from './table-cells/BasicCell';
import { CLIENT_STATUS_OPTIONS, StatusCell, formatStatusLabel } from './table-cells/StatusCell';
import { TodosCell } from './table-cells/TodosCell';
import { LinkCell } from './table-cells/LinkCell';
import { DateCell } from './table-cells/DateCell';
import { DollarSign } from 'lucide-react';
import { ProgressCell } from './table-cells/ProgressCell';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';

const CLIENT_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'No type' },
  { value: 'Agency', label: 'Agency' },
  { value: 'Service', label: 'Service' },
  { value: 'Product', label: 'Product' },
  { value: 'SaaS', label: 'SaaS' },
  { value: 'Startup', label: 'Startup' },
  { value: 'Consulting', label: 'Consulting' },
  { value: 'Coaching', label: 'Coaching' },
  { value: 'Internal', label: 'Internal' },
  { value: 'Partner', label: 'Partner' },
];

function ensureOption(
  options: { value: string; label: string }[],
  rawValue: string | null | undefined,
  labelFormatter: (value: string) => string = (value) => value
): { value: string; label: string }[] {
  if (!rawValue) {
    return options;
  }

  const value = rawValue.trim();
  if (!value.length) {
    return options;
  }

  const exists = options.some((option) => option.value === value);
  if (exists) {
    return options;
  }

  return [
    ...options,
    {
      value,
      label: labelFormatter(value),
    },
  ];
}

interface ClientTableCellProps {
  client: ClientData;
  columnKey: string;
  isEditing: boolean;
  editValue: string;
  editInputRef: React.RefObject<HTMLInputElement>;
  onEditValueChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onDoubleClick: (event: React.MouseEvent) => void;
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
  onSaveEdit,
}: ClientTableCellProps) {
  if (isEditing) {
    if (columnKey === 'status') {
      const options = ensureOption(CLIENT_STATUS_OPTIONS, client.status ?? '', formatStatusLabel);

      return (
        <div onClick={(event) => event.stopPropagation()}>
          <Select
            value={editValue}
            onValueChange={(value) => {
              onEditValueChange(value);
              onSaveEdit({ id: client.id, field: columnKey, value });
            }}
          >
            <SelectTrigger className="h-8 min-w-[150px] border-border/40 bg-black/50 text-sm text-white focus:border-border/60">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="border-border/40 bg-[#14131D] text-white">
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value} className="capitalize">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (columnKey === 'type') {
      const typeOptions = ensureOption(CLIENT_TYPE_OPTIONS, client.type ?? '', (value) => value);

      return (
        <div onClick={(event) => event.stopPropagation()}>
          <Select
            value={editValue}
            onValueChange={(value) => {
              onEditValueChange(value);
              onSaveEdit({ id: client.id, field: columnKey, value });
            }}
          >
            <SelectTrigger className="h-8 min-w-[140px] border-border/40 bg-black/50 text-sm text-white focus:border-border/60">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="border-border/40 bg-[#14131D] text-white">
              {typeOptions.map((option) => (
                <SelectItem key={option.value || 'none'} value={option.value} className="capitalize">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    return (
      <div onClick={(event) => event.stopPropagation()}>
        <Input
          ref={editInputRef}
          value={editValue}
          onChange={(e) => onEditValueChange(e.target.value)}
          onKeyDown={onKeyDown}
          className="h-8 min-w-[120px] border-border/50"
          autoFocus
        />
      </div>
    );
  }

  const renderContent = () => {
    switch (columnKey) {
      case 'business_name':
        return (
          <div
            className="flex flex-col space-y-0.5"
            title={client.business_name || ''}
            onDoubleClick={onDoubleClick}
          >
            <span className="font-medium text-gray-100">{client.business_name || 'Unknown Business'}</span>
          </div>
        );

      case 'progress':
        return <ProgressCell progress={client.progress || 'Not Started'} />;

      case 'status':
        return (
          <div onDoubleClick={onDoubleClick}>
            <StatusCell status={client.status} />
          </div>
        );

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
          <div
            className="max-w-xs truncate"
            title={client[columnKey]?.toString() || ''}
            onDoubleClick={onDoubleClick}
          >
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
export { TableCell } from '@/shared/ui/table';
