
import React, { useState, useEffect } from 'react';
import {
  Gantt,
  GanttSidebar,
  GanttSidebarGroup,
  GanttSidebarItem,
  GanttFeatureList,
  GanttFeatureItem,
  GanttFeatureListGroup,
  GanttHeader,
  GanttStatus,
  GanttFeature,
  GanttMarker,
  GanttTimeline
} from '@/components/ui/gantt';

type TimelineTaskViewProps = {
  memberId: string | undefined;
};

export const TimelineTaskView: React.FC<TimelineTaskViewProps> = ({ memberId }) => {
  const [tasks, setTasks] = useState<GanttFeature[]>([]);
  const [markers, setMarkers] = useState<{id: string; date: Date; label: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This would be replaced with an actual API call in a real application
    const fetchData = async () => {
      setLoading(true);
      // Mock data for demonstration
      setTimeout(() => {
        const statuses: GanttStatus[] = [
          { id: '1', name: 'In Progress', color: '#2563eb' },
          { id: '2', name: 'Completed', color: '#16a34a' },
          { id: '3', name: 'Planned', color: '#9ca3af' }
        ];
        
        const mockTasks: GanttFeature[] = [
          {
            id: '1',
            name: 'Research competitive landscape',
            startAt: new Date(2025, 3, 15),
            endAt: new Date(2025, 3, 22),
            status: statuses[0]
          },
          {
            id: '2',
            name: 'Create wireframes',
            startAt: new Date(2025, 3, 23),
            endAt: new Date(2025, 3, 30),
            status: statuses[2]
          },
          {
            id: '3',
            name: 'Develop prototype',
            startAt: new Date(2025, 4, 1),
            endAt: new Date(2025, 4, 10),
            status: statuses[2]
          }
        ];
        
        const mockMarkers = [
          {
            id: 'milestone-1',
            date: new Date(2025, 3, 20),
            label: 'Design Review'
          },
          {
            id: 'milestone-2',
            date: new Date(2025, 4, 5),
            label: 'Prototype Demo'
          }
        ];
        
        setTasks(mockTasks);
        setMarkers(mockMarkers);
        setLoading(false);
      }, 1000);
    };
    
    fetchData();
  }, [memberId]);

  const handleTaskMove = (id: string, startAt: Date, endAt: Date | null) => {
    setTasks(tasks.map(task => 
      task.id === id 
        ? { ...task, startAt, endAt: endAt || task.endAt } 
        : task
    ));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading timeline...</div>;
  }

  return (
    <div className="border rounded-md overflow-x-auto">
      <Gantt range="daily" today={new Date()}>
        <GanttSidebar>
          <GanttSidebarGroup name="Tasks">
            {tasks.map((task) => (
              <GanttSidebarItem key={task.id} feature={task} />
            ))}
          </GanttSidebarGroup>
        </GanttSidebar>
        <GanttTimeline>
          <GanttHeader />
          <GanttFeatureList>
            <GanttFeatureListGroup>
              {tasks.map((task) => (
                <GanttFeatureItem
                  key={task.id}
                  {...task}
                  onMove={handleTaskMove}
                />
              ))}
            </GanttFeatureListGroup>
            {markers.map(marker => (
              <GanttMarker
                key={marker.id}
                id={marker.id}
                date={marker.date}
                label={marker.label}
              />
            ))}
          </GanttFeatureList>
        </GanttTimeline>
      </Gantt>
    </div>
  );
};
