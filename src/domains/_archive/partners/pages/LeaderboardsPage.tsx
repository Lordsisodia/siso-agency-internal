
import React from 'react';
import { FinancialLayout } from '@/components/layout/FinancialLayout';
import { useNavigate } from 'react-router-dom';
import { Spotlight } from '@/components/ui/spotlight';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, FolderOpen } from 'lucide-react';
import { motion } from 'framer-motion';

// Sample portfolio data - in a real app, this would come from an API
const portfolioApps = [
  {
    id: 'ubahcrypt',
    name: 'UbahCrypt',
    category: 'Web3 Trading',
    description: 'A cryptocurrency trading platform built with React and Web3 technologies.',
    image: '/lovable-uploads/c5921a2f-8856-42f4-bec5-2d08b81c5691.png',
    website: 'https://ubahcrypcom.vercel.app/',
    status: 'active'
  },
  {
    id: 'gritness',
    name: 'Gritness',
    category: 'Fitness',
    description: 'A gym management and fitness tracking application for personal trainers and clients.',
    image: '/lovable-uploads/3b17a23d-630e-4e55-94bf-9d6fef9e6fc4.png',
    website: 'https://gritness-app.vercel.app/',
    status: 'paused'
  },
  {
    id: 'nmconstruction',
    name: 'NM Construction',
    category: 'Business',
    description: 'A construction company website with project portfolio and quote request features.',
    image: '/lovable-uploads/67e004ed-6861-4d6a-b05e-d885a03e5c1e.png',
    website: 'https://nm-construction.vercel.app/',
    status: 'completed'
  }
];

export default function LeaderboardsPage() {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch(status) {
      case "active": return "bg-green-500/20 text-green-400 border-green-500/20";
      case "paused": return "bg-amber-500/20 text-amber-400 border-amber-500/20";
      case "completed": return "bg-blue-500/20 text-blue-400 border-blue-500/20";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/20";
    }
  };

  return (
    <FinancialLayout title="Project Portfolio">
      <div className="relative">
        <Spotlight className="-top-40 left-0" />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-siso-red to-siso-orange bg-clip-text text-transparent">
            SISO Agency Portfolio
          </h1>
          <p className="text-siso-text/80 mt-2">
            Explore some of the amazing projects we've built for our clients. Check out their live websites and see what we can do for your business.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioApps.map((app, index) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-siso-bg-alt border-siso-border h-full flex flex-col">
                <div className="relative aspect-video overflow-hidden">
                  {app.image ? (
                    <img 
                      src={app.image} 
                      alt={app.name} 
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-siso-bg">
                      <FolderOpen className="h-16 w-16 text-siso-orange/30" />
                    </div>
                  )}
                  <Badge 
                    variant="outline" 
                    className={`absolute top-2 right-2 ${getStatusColor(app.status)}`}
                  >
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </Badge>
                </div>
                <CardContent className="pt-6 flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-siso-text-bold">{app.name}</h3>
                    <Badge variant="outline" className="bg-siso-bg-alt text-siso-text-muted border-siso-border">
                      {app.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-siso-text/80 line-clamp-3">
                    {app.description}
                  </p>
                </CardContent>
                <CardFooter className="border-t border-siso-border pt-4">
                  <div className="w-full flex justify-between items-center">
                    <Button 
                      variant="outline" 
                      className="border-siso-border text-siso-text hover:bg-siso-bg hover:text-siso-text-bold"
                      onClick={() => navigate(`/projects/${app.id}`)}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="default"
                      className="bg-siso-orange hover:bg-siso-red text-white"
                      onClick={() => window.open(app.website, '_blank')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" /> Visit Site
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </FinancialLayout>
  );
}
