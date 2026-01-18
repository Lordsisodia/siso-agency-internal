
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { cn } from '@/lib/utils';
import { Brain, Info, Video, User, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// [Analysis] Mock data structure for sources and analysis
const mockSources = [
  { title: "Official Documentation", url: "#", type: "doc" },
  { title: "Related Tutorial: Advanced Implementation", url: "#", type: "video" },
  { title: "GitHub Repository", url: "#", type: "external" },
  { title: "Community Discussion", url: "#", type: "article" },
];

const mockAnalysis = {
  sentiment: 0.85,
  technicalDepth: "Advanced",
  topics: ["Performance Optimization", "State Management", "Testing"],
  prerequisites: ["Basic React", "TypeScript Fundamentals"],
  outcomes: ["Advanced Pattern Implementation", "Performance Optimization Skills"],
};

interface ToolVideoCardProps {
  video: {
    title: string;
    url: string;
    thumbnail_url?: string;
    educator?: {
      name: string;
      avatar_url?: string;
    };
    metrics?: {
      views?: number;
      sentiment_score?: number;
      difficulty?: string;
      impact_score?: number;
    };
  };
  className?: string;
  featured?: boolean;
}

export const ToolVideoCard = ({ video, className, featured = false }: ToolVideoCardProps) => {
  const navigate = useNavigate();
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);

  const handleClick = () => {
    const slug = video.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 60);
    
    const videoId = video.url.split('v=')[1] || '';
    navigate(`/education/videos/${slug}-${videoId}`);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        "group rounded-lg border border-siso-border bg-siso-bg-alt/50 transition-all duration-300",
        "hover:border-siso-orange/30 hover:bg-siso-text/5",
        featured ? "p-6" : "p-4",
        className
      )}
    >
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-lg bg-siso-bg">
            {video.thumbnail_url ? (
              <img
                src={video.thumbnail_url}
                alt={video.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-siso-bg">
                <Video className="w-12 h-12 text-siso-text/20" />
              </div>
            )}
          </AspectRatio>
        </div>

        <div className="md:w-2/3 space-y-4">
          {/* Title and Complexity Section */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <h3 className={cn(
                "font-semibold text-siso-text-bold group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-siso-red group-hover:to-siso-orange",
                featured ? "text-xl" : "text-lg"
              )}>
                {video.title}
              </h3>
              <Badge variant="outline" className="bg-siso-orange/10 text-siso-orange">
                {video.metrics?.difficulty || "Intermediate"}
              </Badge>
            </div>
            
            {/* Brief Summary */}
            <p className="text-sm text-siso-text/70 line-clamp-2">
              Learn advanced techniques and best practices for implementing complex features
              with optimal performance and maintainability.
            </p>
          </div>

          {/* Key Points */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-siso-text-bold">Key Points</h4>
            <ul className="text-sm text-siso-text/70 space-y-1 list-disc list-inside">
              <li>Performance optimization techniques</li>
              <li>Advanced state management patterns</li>
              <li>Testing strategies and best practices</li>
            </ul>
          </div>

          {/* Expandable Sections */}
          <Accordion type="single" collapsible className="w-full">
            {/* Sources Section */}
            <AccordionItem value="sources" className="border-siso-border">
              <AccordionTrigger className="text-sm font-medium hover:no-underline">
                Related Resources
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {mockSources.map((source, index) => (
                    <a
                      key={index}
                      href={source.url}
                      className="flex items-center justify-between p-2 text-sm text-siso-text/70 hover:bg-siso-text/5 rounded-md transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>{source.title}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Analysis Section */}
            <AccordionItem value="analysis" className="border-siso-border">
              <AccordionTrigger className="text-sm font-medium hover:no-underline">
                AI Analysis
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-siso-text/70">Technical Depth</span>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                      {mockAnalysis.technicalDepth}
                    </Badge>
                  </div>
                  
                  <div>
                    <h5 className="text-siso-text/70 mb-1">Key Topics</h5>
                    <div className="flex flex-wrap gap-2">
                      {mockAnalysis.topics.map((topic, index) => (
                        <Badge key={index} variant="outline" className="bg-siso-text/5">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle view full analysis
                    }}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    View Full Analysis
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Footer Metadata */}
          {video.educator && (
            <div className="flex items-center justify-between pt-2 border-t border-siso-border">
              <div className="flex items-center gap-2">
                {video.educator.avatar_url ? (
                  <img
                    src={video.educator.avatar_url}
                    alt={video.educator.name}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-siso-bg flex items-center justify-center">
                    <User className="w-4 h-4 text-siso-text/70" />
                  </div>
                )}
                <p className="text-sm text-siso-text/70">{video.educator.name}</p>
              </div>

              {video.metrics && (
                <div className="flex items-center gap-4 text-sm text-siso-text/60">
                  {video.metrics.views !== undefined && (
                    <span>{video.metrics.views.toLocaleString()} views</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
