
import { GraduationCap } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProfileCard } from './ProfileCard';
import { ProfileSection } from './ProfileSection';
import { motion } from "framer-motion";

interface InterestsBioProps {
  interests?: string[] | null;
  bio?: string | null;
  isEditing: boolean;
  formData: {
    interests: string;
    bio: string;
  };
  onFormChange: (field: string, value: string) => void;
}

export const InterestsBio = ({
  interests,
  bio,
  isEditing,
  formData,
  onFormChange,
}: InterestsBioProps) => {
  return (
    <ProfileCard icon={GraduationCap} title="Interests & Bio" isEditing={isEditing}>
      <div className="space-y-4">
        <ProfileSection label="Interests">
          {isEditing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Input
                placeholder="Interests (comma-separated)"
                value={formData.interests}
                onChange={(e) => onFormChange('interests', e.target.value)}
                className="bg-siso-bg-alt border-siso-border focus:border-siso-orange/50 focus:ring-siso-orange/20"
              />
            </motion.div>
          ) : (
            <motion.p 
              className="text-siso-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {interests?.join(', ') || 'No interests set'}
            </motion.p>
          )}
        </ProfileSection>

        <ProfileSection label="Bio">
          {isEditing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Textarea
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={(e) => onFormChange('bio', e.target.value)}
                className="bg-siso-bg-alt border-siso-border focus:border-siso-orange/50 focus:ring-siso-orange/20 min-h-[100px]"
              />
            </motion.div>
          ) : (
            <motion.p 
              className="text-siso-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {bio || 'No bio set'}
            </motion.p>
          )}
        </ProfileSection>
      </div>
    </ProfileCard>
  );
};
