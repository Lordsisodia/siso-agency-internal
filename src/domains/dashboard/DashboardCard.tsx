
import React from 'react';
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Spotlight } from '@/components/ui/spotlight';
import { motion } from 'framer-motion';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  className?: string;
  delay?: number;
}

export function DashboardCard({ title, description, icon: Icon, href, className = "", delay = 0 }: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay * 0.1 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      <Card className={`relative group bg-black/30 border border-siso-text/10 rounded-lg p-6 transition-all duration-300 hover:border-siso-orange/50 hover:shadow-lg overflow-hidden ${className}`}>
        <Spotlight />
        <div className="flex flex-col h-full">
          <div className="mb-3">
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-r from-siso-red/20 to-siso-orange/20 mb-4">
              <Icon className="h-5 w-5 text-siso-orange" />
            </div>
            <h3 className="font-semibold text-white text-lg mb-2">{title}</h3>
            <p className="text-sm text-siso-text mb-4">{description}</p>
          </div>
          <div className="mt-auto">
            <Button 
              asChild
              variant="ghost" 
              className="p-0 h-auto text-siso-orange hover:text-siso-red hover:bg-transparent"
            >
              <Link to={href} className="flex items-center group">
                <span>Get Started</span>
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
