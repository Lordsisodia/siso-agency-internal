
import React from 'react';
import { DrawerHeader, DrawerTitle } from '@/components/ui/drawer';

export function TaskDetailHeader() {
  return (
    <DrawerHeader>
      <DrawerTitle className="text-center text-xl">Task Details</DrawerTitle>
    </DrawerHeader>
  );
}
