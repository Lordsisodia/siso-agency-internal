/**
 * Deep Work Tab Component
 *
 * Displays deep work tasks with focus session management
 */

import { DeepWorkTaskList } from '@/domains/lifelock/1-daily/4-deep-work/ui/components/DeepWorkTaskList';

export const DeepWorkTab = () => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto py-4">
        <h2 className="text-2xl font-bold mb-4">Deep Work</h2>
        <DeepWorkTaskList />
      </div>
    </div>
  );
};

export default DeepWorkTab;
