
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  tasksCount: {
    total: number;
    completed: number;
  };
}

export function TeamMemberSelector() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Mock team members for now - in a real app this would come from an API
  const teamMembers: TeamMember[] = [
    {
      id: 'siso',
      name: 'SISO',
      tasksCount: { total: 32, completed: 24 }
    },
    {
      id: 'sam',
      name: 'Sam',
      tasksCount: { total: 28, completed: 21 }
    },
  ];
  
  const handleSelectMember = (member: TeamMember) => {
    navigate(`/admin/tasks/${member.id}`);
  };
  
  // Get currently selected member from URL
  const searchParams = new URLSearchParams(location.search);
  const currentMember = searchParams.get('member');
  
  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Team Members</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {teamMembers.map(member => (
          <Card 
            key={member.id}
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${
              currentMember === member.id ? 'bg-purple-50 border-purple-200 ring-2 ring-purple-200' : ''
            }`}
            onClick={() => handleSelectMember(member)}
          >
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-purple-200 text-purple-800">
                  {member.name.charAt(0)}
                </AvatarFallback>
                {member.avatar && <AvatarImage src={member.avatar} />}
              </Avatar>
              
              <div>
                <p className="font-medium">{member.name}</p>
                <div className="text-sm text-muted-foreground">
                  {member.tasksCount.completed}/{member.tasksCount.total} Tasks
                  <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1">
                    <div 
                      className="h-full bg-purple-500 rounded-full" 
                      style={{ 
                        width: `${(member.tasksCount.completed / member.tasksCount.total) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
        
        <Card 
          className={`p-4 cursor-pointer transition-all hover:shadow-md ${
            !currentMember ? 'bg-purple-50 border-purple-200' : ''
          }`}
          onClick={() => navigate('.')}
        >
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-gray-200 text-gray-700">
                All
              </AvatarFallback>
            </Avatar>
            
            <div>
              <p className="font-medium">All Tasks</p>
              <p className="text-sm text-muted-foreground">View all team tasks</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
