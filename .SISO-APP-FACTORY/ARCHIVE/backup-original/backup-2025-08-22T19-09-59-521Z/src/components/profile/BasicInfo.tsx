
import { Shield } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { ProfileCard } from './ProfileCard';
import { ProfileSection } from './ProfileSection';
import { motion } from "framer-motion";

interface BasicInfoProps {
  email: string | null;
  fullName: string | null;
  professionalRole?: string | null;
  isEditing: boolean;
  formData: {
    fullName: string;
    professionalRole: string;
  };
  onFormChange: (field: string, value: string) => void;
}

export const BasicInfo = ({
  email,
  fullName,
  professionalRole,
  isEditing,
  formData,
  onFormChange,
}: BasicInfoProps) => {
  return (
    <ProfileCard icon={Shield} title="Basic Information" isEditing={isEditing}>
      <div className="space-y-4">
        <ProfileSection label="Email">
          <p className="text-siso-text">{email}</p>
        </ProfileSection>
        
        <ProfileSection label="Full Name">
          {isEditing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Input
                value={formData.fullName}
                onChange={(e) => onFormChange('fullName', e.target.value)}
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
              {fullName || 'Not set'}
            </motion.p>
          )}
        </ProfileSection>

        <ProfileSection label="Professional Role">
          {isEditing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Input
                value={formData.professionalRole}
                onChange={(e) => onFormChange('professionalRole', e.target.value)}
                className="bg-siso-bg-alt border-siso-border focus:border-siso-orange/50 focus:ring-siso-orange/20"
                placeholder="e.g., Software Engineer, Product Manager"
              />
            </motion.div>
          ) : (
            <motion.p 
              className="text-siso-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {professionalRole || 'Not set'}
            </motion.p>
          )}
        </ProfileSection>
      </div>
    </ProfileCard>
  );
};
