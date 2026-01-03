import { useState } from 'react';

export interface ReorderableItem {
  id: string;
  sortOrder?: number;
}

export function useTaskReordering<T extends ReorderableItem>(
  items: T[],
  setItems: (items: T[]) => void,
  onReorder?: (itemId: string, newIndex: number) => void
) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, item: T) => {
    setIsDragging(true);
    setDraggedId(item.id);
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
    
    // Add visual feedback to dragged element
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.7';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    setDraggedId(null);
    
    // Restore opacity
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    
    const draggedIndex = items.findIndex(item => item.id === draggedId);
    if (draggedIndex === -1 || draggedIndex === targetIndex) {
      setIsDragging(false);
      setDraggedId(null);
      return;
    }

    // Reorder the items array
    const reorderedItems = [...items];
    const [draggedItem] = reorderedItems.splice(draggedIndex, 1);
    reorderedItems.splice(targetIndex, 0, draggedItem);
    
    // Update sort order
    const updatedItems = reorderedItems.map((item, index) => ({
      ...item,
      sortOrder: index
    }));
    
    setItems(updatedItems);
    onReorder?.(draggedId, targetIndex);
    
    setIsDragging(false);
    setDraggedId(null);
  };

  const getDropZoneProps = (index: number) => ({
    onDragOver: handleDragOver,
    onDrop: (e: React.DragEvent) => handleDrop(e, index),
    className: `${isDragging ? 'border-t-2 border-blue-500 border-dashed' : ''}`
  });

  return {
    isDragging,
    draggedId,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    getDropZoneProps
  };
}