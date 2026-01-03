import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bitcoin, ExternalLink, GitBranch, Code, Server, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatDate } from '@/lib/formatters';
import { GlowEffect } from '@/components/ui/glow-effect';

interface ProjectDirectoryCardProps {
  name?: string;
  logo?: string;
  description?: string;
  status?: string;
  created_at?: string;
  onSelect?: () => void;
}

export function ProjectDirectoryCard({ 
  name, 
  logo, 
  description, 
  status = 'active',
  created_at,
  onSelect 
}: ProjectDirectoryCardProps) {
  const navigate = useNavigate();

  if (!name) {
    return (
      <div className="relative">
        <GlowEffect
          colors={['#ea384c', '#8B0000', '#FF0000', '#600000']}
          mode="static"
          blur="medium"
        />
        <Card 
          onClick={() => navigate('/onboarding-chat')}
          className="relative p-12 flex flex-col items-center justify-center gap-8 cursor-pointer bg-black/80 backdrop-blur-xl border border-[#ea384c]/20 hover:border-[#ea384c]/50 transition-all duration-300"
        >
          <div className="h-40 w-40 rounded-full bg-gradient-to-r from-[#ea384c] to-black flex items-center justify-center">
            <Bitcoin size={80} className="text-white" />
          </div>
          <div className="text-center space-y-4">
            <h3 className="text-3xl font-semibold text-white">Start New Crypto Project</h3>
            <p className="text-siso-text max-w-xl text-lg">
              Begin your blockchain journey by creating a new cryptocurrency project
            </p>
            <Button 
              className="w-full bg-gradient-to-r from-siso-red to-siso-orange text-white"
              onClick={() => navigate('/onboarding-chat')}
            >
              Start Building
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const handleCardClick = () => {
    navigate(`/projects/${name?.toLowerCase()}`);
  };

  return (
    <div className="relative w-full">
      <GlowEffect
        colors={['#ea384c', '#8B0000', '#FF0000', '#600000']}
        mode="static"
        blur="medium"
      />
      <Card 
        onClick={handleCardClick}
        className="relative p-8 bg-black/80 backdrop-blur-xl border border-[#ea384c]/20 hover:border-[#ea384c]/50 transition-all duration-300 group w-full cursor-pointer"
      >
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0">
            {logo ? (
              <img
                src={logo}
                alt={`${name} logo`}
                className="h-40 w-40 rounded-full object-cover ring-4 ring-[#ea384c]/20 group-hover:ring-[#ea384c]/40 transition-all duration-300"
                loading="lazy"
              />
            ) : (
              <div className="h-40 w-40 rounded-full bg-gradient-to-br from-[#ea384c] to-black flex items-center justify-center ring-4 ring-[#ea384c]/20 group-hover:ring-[#ea384c]/40 transition-all duration-300">
                <img 
                  src="/public/lovable-uploads/37c88c59-ac56-4cf7-a671-e918e9338bc9.png" 
                  alt={`${name} logo`} 
                  className="h-24 w-24 object-contain"
                />
              </div>
            )}
          </div>
          
          <div className="flex-grow space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-3xl font-semibold text-white group-hover:text-[#ea384c] transition-colors duration-300">
                  {name}
                </h3>
                <p className="text-base text-siso-text mt-2">
                  Created on {formatDate(created_at || '', 'long')}
                </p>
              </div>
              <Badge 
                variant="secondary" 
                className="text-base px-4 py-1 bg-[#ea384c]/20 text-[#ea384c]"
              >
                {status}
              </Badge>
            </div>
            
            {description && (
              <p className="text-siso-text text-lg leading-relaxed max-w-3xl">
                {description}
              </p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-siso-text">
                  <Code size={16} />
                  <span>Smart Contract</span>
                </div>
                <Progress value={80} className="h-2" indicatorColor="#ea384c" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-siso-text">
                  <Server size={16} />
                  <span>Backend Integration</span>
                </div>
                <Progress value={65} className="h-2" indicatorColor="#ea384c" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-siso-text">
                  <GitBranch size={16} />
                  <span>Testing</span>
                </div>
                <Progress value={45} className="h-2" indicatorColor="#ea384c" />
              </div>
            </div>
            
            <div className="flex gap-4 mt-8">
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/projects/tasks');
                }}
                variant="outline"
                className="border-[#ea384c]/30 text-[#ea384c] hover:bg-[#ea384c]/10 flex-1 py-6 text-lg"
              >
                View Development Tasks
              </Button>
              <Button 
                onClick={onSelect}
                className="bg-gradient-to-r from-[#ea384c] to-black hover:opacity-90 flex-1 py-6 text-lg"
              >
                Open Project Dashboard
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
