
import React from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table";
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';

export function TaskTable() {
  // Placeholder data - in a real implementation, this would come from Supabase
  const tasks = [
    {
      id: '1',
      name: 'Review Client X MVP',
      category: 'Client Work',
      dueDate: '2025-04-18',
      status: 'Not Started',
      priority: 'High',
      assignedTo: 'You'
    },
    {
      id: '2',
      name: 'Call Sam for Instagram outreach',
      category: 'Outreach',
      dueDate: '2025-04-18',
      status: 'In Progress',
      priority: 'Medium',
      assignedTo: 'You'
    },
    {
      id: '3',
      name: 'Update client dashboard design',
      category: 'Admin',
      dueDate: '2025-04-19',
      status: 'Completed',
      priority: 'Low',
      assignedTo: 'Jane'
    }
  ];

  // Function to render status icons with appropriate colors
  const renderStatus = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'In Progress':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      default:
        return <Circle className="h-5 w-5 text-slate-300" />;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead>Task Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>{renderStatus(task.status)}</TableCell>
              <TableCell className="font-medium">{task.name}</TableCell>
              <TableCell>{task.category}</TableCell>
              <TableCell>{task.dueDate}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.priority === 'High' 
                    ? 'bg-red-100 text-red-800' 
                    : task.priority === 'Medium'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {task.priority}
                </span>
              </TableCell>
              <TableCell>{task.assignedTo}</TableCell>
              <TableCell className="text-right">
                <button className="text-slate-400 hover:text-slate-600">Edit</button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
