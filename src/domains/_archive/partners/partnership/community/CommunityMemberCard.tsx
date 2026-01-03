import { Card, CardContent } from "@/components/ui/card";
import { Users, Link, Youtube, Brain, TrendingUp } from 'lucide-react';
import { CommunityMember } from "./types";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNavigate } from 'react-router-dom';

interface CommunityMemberCardProps {
  member: CommunityMember;
  onClick: (member: CommunityMember) => void;
  viewMode?: 'grid' | 'list';
}

export const CommunityMemberCard = ({ member, onClick, viewMode }: CommunityMemberCardProps) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (member.slug) {
      navigate(`/education/educators/${member.slug}`);
    } else {
      onClick(member);
    }
  };

  const generateAIAnalysis = () => {
    return {
      expertise: "Based on the content and specialization, this creator shows strong expertise in " + 
                (member.specialization?.[0] || "their field"),
      audience: "Their content appears to be most suitable for " +
                (member.member_type === "Business" ? "business professionals and entrepreneurs" : 
                 member.member_type === "Technology" ? "tech enthusiasts and developers" :
                 "individuals interested in personal growth"),
      uniqueValue: "Their unique value proposition lies in " +
                  (member.content_themes?.length ? `their focus on ${member.content_themes[0]}` : "their specialized content"),
      engagement: member.youtube_url ? "They maintain an active YouTube presence with regular content updates" : 
                 "They provide valuable insights through their platform",
      growth: "Community showing " + (member.member_count && member.member_count > 1000 ? "strong" : "steady") + " growth potential",
    };
  };

  const analysis = generateAIAnalysis();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className="group bg-gradient-to-br from-siso-red/10 to-siso-orange/10 border-siso-text/10 hover:border-siso-orange/50 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-siso-orange/50 relative overflow-hidden"
        onClick={handleClick}
        tabIndex={0}
        role="button"
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {member.profile_image_url ? (
              <motion.img 
                src={member.profile_image_url} 
                alt={member.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-siso-orange/20 group-hover:border-siso-orange/50 transition-colors shrink-0"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
              />
            ) : (
              <motion.div 
                className="w-12 h-12 rounded-full bg-gradient-to-br from-siso-red/20 to-siso-orange/20 flex items-center justify-center group-hover:from-siso-red/30 group-hover:to-siso-orange/30 transition-colors shrink-0"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Users className="w-6 h-6 text-siso-orange" />
              </motion.div>
            )}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold text-siso-text-bold group-hover:text-siso-orange transition-colors line-clamp-2 leading-tight" title={member.name}>
                  {member.name}
                </h3>
                {member.member_count && member.member_count > 1000 && (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                )}
              </div>
              <p className="text-sm text-siso-text/80 capitalize">{member.member_type}</p>
            </div>
          </div>
          
          {member.description && (
            <p className="mt-3 text-sm text-siso-text line-clamp-2 group-hover:text-siso-text/90">
              {member.description}
            </p>
          )}
          
          <div className="flex flex-wrap gap-2 mt-3">
            {member.specialization?.slice(0, 2).map((spec, index) => (
              <motion.span 
                key={index}
                className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-siso-red/20 to-siso-orange/20 text-siso-text-bold"
                whileHover={{ scale: 1.05 }}
              >
                {spec}
              </motion.span>
            ))}
          </div>

          <motion.div 
            className="flex items-center gap-2 mt-3 text-siso-text/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2">
              {member.website_url && (
                <Link className="w-4 h-4 hover:text-siso-orange transition-colors" />
              )}
              {member.youtube_url && (
                <Youtube className="w-4 h-4 hover:text-siso-orange transition-colors" />
              )}
              <Dialog>
                <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 p-0 hover:bg-siso-orange/10 hover:text-siso-orange transition-colors"
                  >
                    <Brain className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-siso-bg border-siso-text/10">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold bg-gradient-to-r from-siso-red to-siso-orange text-transparent bg-clip-text">
                      AI Analysis: {member.name}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-siso-text">Expertise Level</h4>
                      <p className="text-siso-text/80">{analysis.expertise}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-siso-text">Target Audience</h4>
                      <p className="text-siso-text/80">{analysis.audience}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-siso-text">Unique Value</h4>
                      <p className="text-siso-text/80">{analysis.uniqueValue}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-siso-text">Engagement</h4>
                      <p className="text-siso-text/80">{analysis.engagement}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-siso-text">Growth Potential</h4>
                      <p className="text-siso-text/80">{analysis.growth}</p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
