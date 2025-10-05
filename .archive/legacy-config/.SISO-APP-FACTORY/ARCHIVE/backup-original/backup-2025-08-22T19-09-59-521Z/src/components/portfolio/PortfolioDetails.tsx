
import { useState } from 'react';
import { PortfolioItem } from '@/types/portfolio';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ExternalLink, Github, Calendar, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface PortfolioDetailsProps {
  item: PortfolioItem;
}

export const PortfolioDetails = ({ item }: PortfolioDetailsProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Extract YouTube video ID if the live_url is a YouTube link
  const getYoutubeId = (url: string | undefined) => {
    if (!url) return null;
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    return match ? match[1] : null;
  };
  
  const youtubeId = getYoutubeId(item.live_url);
  
  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Left column - Image and links */}
        <div className="lg:col-span-2">
          {youtubeId ? (
            <div className="aspect-video w-full rounded-lg overflow-hidden">
              <iframe 
                width="100%" 
                height="100%" 
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title={`${item.title} video`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full object-cover"
              ></iframe>
            </div>
          ) : item.image_url ? (
            <div 
              className="w-full aspect-video bg-cover bg-center rounded-lg"
              style={{ backgroundImage: `url(${item.image_url})` }}
            />
          ) : (
            <div className="w-full aspect-video bg-gradient-to-br from-siso-red/20 to-siso-orange/20 rounded-lg flex items-center justify-center">
              <span className="text-siso-text/50">No preview available</span>
            </div>
          )}
          
          <div className="flex gap-4 mt-4 flex-wrap">
            {item.live_url && !youtubeId && (
              <Button variant="default" size="sm" asChild>
                <a href={item.live_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Live Site
                </a>
              </Button>
            )}
            {item.github_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={item.github_url} target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 mr-2" />
                  View Source Code
                </a>
              </Button>
            )}
          </div>
        </div>
        
        {/* Right column - Details */}
        <div>
          <Card className="p-6 h-full">
            <h2 className="text-2xl font-bold mb-4">{item.title}</h2>
            
            <div className="space-y-4">
              {item.completion_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-siso-orange" />
                  <span className="text-sm">Completed {new Date(item.completion_date).toLocaleDateString(undefined, { 
                    year: 'numeric', 
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              )}
              
              {item.technologies?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Code className="h-4 w-4 text-siso-orange" /> Technologies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {item.technologies.map((tech) => (
                      <span 
                        key={tech}
                        className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {item.description && (
                <div>
                  <h3 className="text-sm font-medium mb-1">About this project</h3>
                  <p className="text-sm text-siso-text/80">{item.description}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </motion.div>
      
      {/* Tabs for additional content */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="highlights">Highlights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Project Overview</h3>
            <p className="text-siso-text/80 mb-4">{item.description}</p>
            
            {item.highlights?.some(h => h.toLowerCase().includes('challenge') || h.toLowerCase().includes('problem')) && (
              <div className="mt-6">
                <h4 className="text-lg font-medium mb-2">Challenges</h4>
                <ul className="list-disc list-inside space-y-2">
                  {item.highlights
                    .filter(h => h.toLowerCase().includes('challenge') || h.toLowerCase().includes('problem'))
                    .map((highlight, i) => (
                      <li key={i} className="text-siso-text/80">{highlight}</li>
                    ))}
                </ul>
              </div>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="features" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Key Features</h3>
            {item.highlights?.length > 0 ? (
              <ul className="space-y-3">
                {item.highlights
                  .filter(h => !h.toLowerCase().includes('challenge') && !h.toLowerCase().includes('problem'))
                  .map((highlight, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-siso-orange/10 text-siso-orange text-xs font-medium">
                        {i + 1}
                      </span>
                      <span className="text-siso-text/80">{highlight}</span>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-siso-text/60">No feature details available for this project.</p>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="highlights" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Project Highlights</h3>
            {item.highlights?.length > 0 ? (
              <div className="space-y-4">
                {item.highlights.map((highlight, i) => (
                  <div key={i} className="p-3 bg-siso-text/5 rounded-lg">
                    <p className="text-siso-text/80">{highlight}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-siso-text/60">No highlights available for this project.</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
