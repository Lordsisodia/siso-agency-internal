
import { Link, Linkedin, Globe, Youtube, Instagram, Twitter } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { ProfileCard } from './ProfileCard';
import { motion } from "framer-motion";

interface SocialMediaLinksProps {
  linkedinUrl?: string | null;
  websiteUrl?: string | null;
  youtubeUrl?: string | null;
  instagramUrl?: string | null;
  twitterUrl?: string | null;
  isEditing: boolean;
  formData: {
    linkedinUrl: string;
    websiteUrl: string;
    youtubeUrl: string;
    instagramUrl: string;
    twitterUrl: string;
  };
  onFormChange: (field: string, value: string) => void;
}

export const SocialMediaLinks = ({
  linkedinUrl,
  websiteUrl,
  youtubeUrl,
  instagramUrl,
  twitterUrl,
  isEditing,
  formData,
  onFormChange,
}: SocialMediaLinksProps) => {
  return (
    <ProfileCard icon={Link} title="Social Media & Links" isEditing={isEditing}>
      <div className="space-y-4">
        {isEditing ? (
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <Linkedin className="w-4 h-4 text-siso-text/70" />
              <Input
                placeholder="LinkedIn URL"
                value={formData.linkedinUrl}
                onChange={(e) => onFormChange('linkedinUrl', e.target.value)}
                className="bg-siso-bg-alt border-siso-border focus:border-siso-orange/50 focus:ring-siso-orange/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-siso-text/70" />
              <Input
                placeholder="Website URL"
                value={formData.websiteUrl}
                onChange={(e) => onFormChange('websiteUrl', e.target.value)}
                className="bg-siso-bg-alt border-siso-border focus:border-siso-orange/50 focus:ring-siso-orange/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <Youtube className="w-4 h-4 text-siso-text/70" />
              <Input
                placeholder="YouTube URL"
                value={formData.youtubeUrl}
                onChange={(e) => onFormChange('youtubeUrl', e.target.value)}
                className="bg-siso-bg-alt border-siso-border focus:border-siso-orange/50 focus:ring-siso-orange/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <Instagram className="w-4 h-4 text-siso-text/70" />
              <Input
                placeholder="Instagram URL"
                value={formData.instagramUrl}
                onChange={(e) => onFormChange('instagramUrl', e.target.value)}
                className="bg-siso-bg-alt border-siso-border focus:border-siso-orange/50 focus:ring-siso-orange/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <Twitter className="w-4 h-4 text-siso-text/70" />
              <Input
                placeholder="Twitter URL"
                value={formData.twitterUrl}
                onChange={(e) => onFormChange('twitterUrl', e.target.value)}
                className="bg-siso-bg-alt border-siso-border focus:border-siso-orange/50 focus:ring-siso-orange/20"
              />
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {linkedinUrl && (
              <motion.a 
                href={linkedinUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-siso-text hover:text-siso-red transition-colors"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </motion.a>
            )}
            {websiteUrl && (
              <motion.a 
                href={websiteUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-siso-text hover:text-siso-red transition-colors"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Globe className="w-4 h-4" />
                Website
              </motion.a>
            )}
            {youtubeUrl && (
              <motion.a 
                href={youtubeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-siso-text hover:text-siso-red transition-colors"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Youtube className="w-4 h-4" />
                YouTube
              </motion.a>
            )}
            {instagramUrl && (
              <motion.a 
                href={instagramUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-siso-text hover:text-siso-red transition-colors"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Instagram className="w-4 h-4" />
                Instagram
              </motion.a>
            )}
            {twitterUrl && (
              <motion.a 
                href={twitterUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-siso-text hover:text-siso-red transition-colors"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </motion.a>
            )}
            {!linkedinUrl && !websiteUrl && !youtubeUrl && !instagramUrl && !twitterUrl && (
              <p className="text-siso-text/70">No social media links set</p>
            )}
          </motion.div>
        )}
      </div>
    </ProfileCard>
  );
};
