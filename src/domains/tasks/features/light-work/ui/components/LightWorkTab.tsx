/**
 * Light Work Tab Component
 *
 * Displays light work tasks with quick actions
 */

import LightWorkTaskList from '@/domains/lifelock/1-daily/3-light-work/ui/components/LightWorkTaskList';

export const LightWorkTab = () => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto py-4">
        <h2 className="text-2xl font-bold mb-4">Light Work</h2>
        <LightWorkTaskList />
      </div>
    </div>
  );
};

export default LightWorkTab;
