
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/formatters';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface ProjectHeaderProps {
  name: string;
  description?: string;
  status?: string;
  created_at?: string;
}

export function ProjectHeader({ name, description, status, created_at }: ProjectHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-xl bg-black/30 border border-white/10 p-8 backdrop-blur-xl shadow-lg hover:shadow-xl hover:shadow-[#ea384c]/5 transition-all duration-300"
    >
      <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
        <div className="h-40 w-40 rounded-full bg-gradient-to-br from-black to-[#222] flex items-center justify-center ring-4 ring-[#ea384c]/20 shadow-lg shadow-[#ea384c]/10">
          <img 
            src="/public/lovable-uploads/37c88c59-ac56-4cf7-a671-e918e9338bc9.png" 
            alt="UbahCrypt Logo"
            className="w-24 h-24 object-contain animate-fade-in"
          />
        </div>
        
        <div className="flex-grow">
          <div className="flex items-start justify-between mb-4 flex-col md:flex-row gap-4 md:gap-0">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent mb-2">
                {name}
              </h1>
              <div className="flex items-center gap-2 text-neutral-400">
                <Clock className="w-4 h-4" />
                <p>Created on {formatDate(created_at || '', 'long')}</p>
              </div>
            </div>
            <Badge 
              variant="secondary" 
              className="text-base px-4 py-1.5 bg-[#ea384c]/20 text-[#ea384c] border border-[#ea384c]/20 uppercase tracking-wide hover:bg-[#ea384c]/30 transition-colors duration-300"
            >
              {status}
            </Badge>
          </div>
          
          {description && (
            <p className="text-neutral-300 text-lg leading-relaxed max-w-3xl mb-6">
              {description}
            </p>
          )}
          
          <div className="mt-4 flex flex-wrap gap-3">
            <Badge variant="outline" className="bg-black/20 text-white border-white/10 px-3 py-1.5">
              Blockchain
            </Badge>
            <Badge variant="outline" className="bg-black/20 text-white border-white/10 px-3 py-1.5">
              Cryptocurrency
            </Badge>
            <Badge variant="outline" className="bg-black/20 text-white border-white/10 px-3 py-1.5">
              Smart Contract
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-tr from-[#ea384c]/10 via-transparent to-red-500/10" />
    </motion.div>
  );
}
