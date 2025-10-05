
import { Briefcase } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { ProfileCard } from './ProfileCard';
import { ProfileSection } from './ProfileSection';
import { motion } from "framer-motion";

interface BusinessInfoProps {
  businessName?: string | null;
  businessType?: string | null;
  industry?: string | null;
  isEditing: boolean;
  formData: {
    businessName: string;
    businessType: string;
    industry: string;
  };
  onFormChange: (field: string, value: string) => void;
}

export const BusinessInfo = ({
  businessName,
  businessType,
  industry,
  isEditing,
  formData,
  onFormChange,
}: BusinessInfoProps) => {
  return (
    <ProfileCard icon={Briefcase} title="Business Information" isEditing={isEditing}>
      <div className="space-y-4">
        <ProfileSection label="Business Name">
          {isEditing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Input
                value={formData.businessName}
                onChange={(e) => onFormChange('businessName', e.target.value)}
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
              {businessName || 'Not set'}
            </motion.p>
          )}
        </ProfileSection>

        <ProfileSection label="Business Type">
          {isEditing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Input
                value={formData.businessType}
                onChange={(e) => onFormChange('businessType', e.target.value)}
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
              {businessType || 'Not set'}
            </motion.p>
          )}
        </ProfileSection>

        <ProfileSection label="Industry">
          {isEditing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Input
                value={formData.industry}
                onChange={(e) => onFormChange('industry', e.target.value)}
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
              {industry || 'Not set'}
            </motion.p>
          )}
        </ProfileSection>
      </div>
    </ProfileCard>
  );
};
