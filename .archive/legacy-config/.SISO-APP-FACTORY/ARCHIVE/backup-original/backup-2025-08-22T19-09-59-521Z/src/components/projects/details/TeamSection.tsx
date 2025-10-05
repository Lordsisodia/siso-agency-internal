
import { Pill, PillAvatar, PillAvatarGroup, PillIndicator } from '@/components/ui/pill';
import { Card } from '@/components/ui/card';

interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  status: 'active' | 'offline' | 'away';
}

interface TeamSectionProps {
  teamMembers: readonly TeamMember[] | TeamMember[];
}

export function TeamSection({ teamMembers }: TeamSectionProps) {
  return (
    <Card className="p-8 bg-black/30 border-siso-text/10">
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-6">Team Members</h2>
        
        <div className="grid gap-4">
          {teamMembers.map((member) => (
            <div key={member.name} className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-siso-text/10">
              <div className="flex items-center gap-4">
                <PillAvatar
                  src={member.avatar}
                  fallback={member.name.split(' ').map(n => n[0]).join('')}
                  className="h-10 w-10"
                />
                <div>
                  <h3 className="font-medium text-white">{member.name}</h3>
                  <p className="text-sm text-siso-text">{member.role}</p>
                </div>
              </div>
              
              <Pill variant="secondary" className="bg-black/30">
                <PillIndicator 
                  variant={member.status === 'active' ? 'success' : member.status === 'away' ? 'warning' : 'error'} 
                  pulse={member.status === 'active'}
                />
                {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
              </Pill>
            </div>
          ))}
        </div>
        
        <div className="mt-8">
          <Pill className="bg-black/30">
            <PillAvatarGroup>
              {teamMembers.map((member) => (
                <PillAvatar
                  key={member.name}
                  src={member.avatar}
                  fallback={member.name.split(' ').map(n => n[0]).join('')}
                />
              ))}
            </PillAvatarGroup>
            {teamMembers.length} Active Team Members
          </Pill>
        </div>
      </div>
    </Card>
  );
}
