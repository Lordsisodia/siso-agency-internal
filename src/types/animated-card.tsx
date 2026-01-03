import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from "./card";

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  headerClassName?: string;
  delay?: number;
}

export function AnimatedCard({ children, className, title, headerClassName, delay = 0 }: AnimatedCardProps) {
  // Use a key to prevent the "multiple children in AnimatePresence" warning
  const cardKey = React.useId();
  
  return (
    <motion.div
      key={cardKey}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay }}
      className="will-change-transform"
    >
      <Card className={cn(
        "border-gray-800 bg-black/30 backdrop-blur-sm transition-all duration-300",
        "hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10",
        className
      )}>
        {title && (
          <CardHeader className={cn("flex flex-row items-center justify-between pb-2 pt-6", headerClassName)}>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>{children}</CardContent>
      </Card>
    </motion.div>
  );
}
