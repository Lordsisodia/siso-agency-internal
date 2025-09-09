
import { motion } from 'framer-motion';
import { ExternalLink, Github, Clock } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { PortfolioItem } from '@/types/portfolio';
import { Badge } from '@/shared/ui/badge';
import { Card, CardHeader, CardContent, CardFooter } from '@/shared/ui/card';

interface PortfolioCardProps {
  item: PortfolioItem;
  onSelect: () => void;
}

export const PortfolioCard = ({ item, onSelect }: PortfolioCardProps) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full flex flex-col overflow-hidden border border-siso-border hover:border-siso-orange/30 bg-siso-bg-alt/80">
        <CardHeader className="space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-semibold line-clamp-2">{item.title}</h3>
            {item.development_status && (
              <Badge variant="outline" className="capitalize">
                {item.development_status.replace('_', ' ')}
              </Badge>
            )}
          </div>
          {item.client_name && (
            <div className="flex items-center gap-2 text-sm text-siso-text/70">
              <Clock className="w-4 h-4" />
              Client: {item.client_name}
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-grow">
          {item.description && (
            <p className="text-sm text-siso-text/80 line-clamp-3 mb-4">
              {item.description}
            </p>
          )}
          
          {item.technologies && item.technologies.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.technologies.map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs">
                  {tech}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="grid grid-cols-2 gap-2 pt-4">
          <Button variant="outline" size="sm" onClick={onSelect}>
            View Details
          </Button>
          <div className="flex justify-end gap-2">
            {item.live_url && (
              <Button variant="outline" size="icon" asChild>
                <a href={item.live_url} target="_blank" rel="noopener noreferrer" title="Visit Live Site">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
            {item.github_url && (
              <Button variant="outline" size="icon" asChild>
                <a href={item.github_url} target="_blank" rel="noopener noreferrer" title="View Source Code">
                  <Github className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
