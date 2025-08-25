
import { motion } from 'framer-motion';
import { TeamMemberCard } from './TeamMemberCard';

const teamMembers = [
  {
    id: 'siso',
    name: 'SISO',
    role: 'Lead Developer',
    stats: {
      tasks: 32,
      completed: 24,
      inProgress: 8
    }
  },
  {
    id: 'sam',
    name: 'Sam',
    role: 'Project Manager',
    stats: {
      tasks: 28,
      completed: 21,
      inProgress: 7
    }
  },
  {
    id: 'member3',
    name: 'Open Position',
    role: 'Developer',
    stats: {
      tasks: 0,
      completed: 0,
      inProgress: 0
    }
  },
  {
    id: 'member4',
    name: 'Open Position',
    role: 'Designer',
    stats: {
      tasks: 0,
      completed: 0,
      inProgress: 0
    }
  }
];

export function TeamMembersGrid() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {teamMembers.map((member) => (
        <TeamMemberCard
          key={member.id}
          {...member}
        />
      ))}
    </motion.div>
  );
}
