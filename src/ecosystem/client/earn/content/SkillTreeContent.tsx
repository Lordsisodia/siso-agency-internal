
import { SkillPath, Skill, UserSkillProgress } from '@/types/skills';
import { SkillsList } from './SkillsList';
import { SkillPathCard } from './SkillPathCard';

interface SkillTreeContentProps {
  skillPaths: SkillPath[];
  skills: Skill[];
  userProgress: UserSkillProgress[];
  selectedPath: string | null;
  setSelectedPath: (path: string | null) => void;
  isLoading: boolean;
  onExternalLinkClick?: (url: string) => void;
}

export const SkillTreeContent = ({
  skillPaths,
  skills,
  userProgress,
  selectedPath,
  setSelectedPath,
  isLoading,
  onExternalLinkClick
}: SkillTreeContentProps) => {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skillPaths.map((path) => (
          <SkillPathCard
            key={path.id}
            path={path}
            skills={skills.filter(s => s.path_id === path.id)}
            userProgress={userProgress}
            isSelected={selectedPath === path.id}
            onClick={() => setSelectedPath(path.id)}
          />
        ))}
      </div>
      
      {selectedPath && (
        <SkillsList
          skills={skills}
          userProgress={userProgress}
          skillPaths={skillPaths}
          onExternalLinkClick={onExternalLinkClick}
        />
      )}
    </div>
  );
};
