
import { useState } from 'react';

export interface TableColumn {
  key: string;
  label: string;
  visible: boolean;
  pinned?: boolean;
  width?: number;
}

export function useTableColumns(initialColumns: TableColumn[]) {
  const [columns, setColumns] = useState(initialColumns);

  const updateColumnVisibility = (updatedColumns: TableColumn[]) => {
    setColumns(updatedColumns);
  };

  const visibleColumns = columns.filter(col => col.visible);

  return {
    columns,
    visibleColumns,
    updateColumnVisibility
  };
}
