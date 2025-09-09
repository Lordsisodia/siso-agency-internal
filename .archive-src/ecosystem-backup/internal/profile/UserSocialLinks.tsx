
import React from 'react';
import { Linkedin, Globe, Youtube, Instagram, Twitter } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserSocialLinksProps {
  profile: {
    linkedin_url?: string | null;
    website_url?: string | null;
    youtube_url?: string | null;
    instagram_url?: string | null;
    twitter_url?: string | null;
  };
  className?: string;
}

export const UserSocialLinks = ({ profile, className = '' }: UserSocialLinksProps) => {
  const hasSocialLinks = profile.linkedin_url || profile.website_url || 
    profile.youtube_url || profile.instagram_url || profile.twitter_url;

  if (!hasSocialLinks) return null;

  return (
    <div className={`flex flex-wrap gap-4 ${className}`}>
      {profile.linkedin_url && (
        <motion.a 
          href={profile.linkedin_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-siso-text/80 hover:text-siso-red transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Linkedin className="w-3 h-3" />
          <span>LinkedIn</span>
        </motion.a>
      )}
      {profile.website_url && (
        <motion.a 
          href={profile.website_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-siso-text/80 hover:text-siso-red transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Globe className="w-3 h-3" />
          <span>Website</span>
        </motion.a>
      )}
      {profile.youtube_url && (
        <motion.a 
          href={profile.youtube_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-siso-text/80 hover:text-siso-red transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Youtube className="w-3 h-3" />
          <span>YouTube</span>
        </motion.a>
      )}
      {profile.instagram_url && (
        <motion.a 
          href={profile.instagram_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-siso-text/80 hover:text-siso-red transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Instagram className="w-3 h-3" />
          <span>Instagram</span>
        </motion.a>
      )}
      {profile.twitter_url && (
        <motion.a 
          href={profile.twitter_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-siso-text/80 hover:text-siso-red transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Twitter className="w-3 h-3" />
          <span>Twitter</span>
        </motion.a>
      )}
    </div>
  );
};
