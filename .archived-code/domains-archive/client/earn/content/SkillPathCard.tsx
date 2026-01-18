
import { motion } from 'framer-motion';
import { SkillPath, Skill, UserSkillProgress } from '@/types/skills';
import { Progress } from '@/components/ui/progress';
import { LucideIcon, GraduationCap, PenTool, Users, Code } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillPathCardProps {
  path: SkillPath;
  skills: Skill[];
  userProgress: UserSkillProgress[];
  isSelected: boolean;
  onClick: () => void;
}

const iconMap: Record<string, LucideIcon> = {
  'graduation-cap': GraduationCap,
  'pen-tool': PenTool,
  'users': Users,
  'code': Code,
};

export const SkillPathCard = ({
  path,
  skills,
  userProgress,
  isSelected,
  onClick
}: SkillPathCardProps) => {
  const Icon = iconMap[path.icon] || GraduationCap;
  
  const completedSkills = skills.filter(skill => 
    userProgress.some(p => 
      p.skill_id === skill.id && p.completed_at
    )
  ).length;

  const progressPercentage = (completedSkills / skills.length) * 100;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative p-6 rounded-lg border cursor-pointer transition-colors",
        "bg-gradient-to-br from-siso-bg-alt/50 to-siso-bg-alt/30",
        "hover:from-siso-bg-alt/60 hover:to-siso-bg-alt/40",
        isSelected ? "border-siso-orange" : "border-siso-border",
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-lg bg-siso-orange/10">
          <Icon className="w-6 h-6 text-siso-orange" />
        </div>
        <div className="px-2 py-1 text-xs rounded-full bg-siso-text/10">
          Level {path.level}
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-2">{path.name}</h3>
      <p className="text-sm text-siso-text/80 mb-4">{path.description}</p>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{completedSkills}/{skills.length} Complete</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>
    </motion.div>
  );
};
