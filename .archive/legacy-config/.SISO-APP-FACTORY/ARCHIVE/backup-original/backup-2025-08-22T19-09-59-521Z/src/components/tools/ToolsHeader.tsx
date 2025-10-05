import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { motion } from 'framer-motion';

interface ToolsHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  totalTools?: number;
}

export function ToolsHeader({ searchQuery, onSearchChange, totalTools }: ToolsHeaderProps) {
  return (
    <div className="space-y-8">
      <motion.div 
        className="flex flex-col items-center text-center gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full max-w-4xl">
          <div className="flex flex-col items-center justify-center gap-2">
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-siso-red to-siso-orange text-transparent bg-clip-text tracking-tight">
              Tools and Platforms
            </h1>
            {totalTools !== undefined && (
              <span className="text-lg text-siso-text/60">
                {totalTools} tools available
              </span>
            )}
          </div>
          <p className="mt-6 text-lg sm:text-xl text-siso-text/80 leading-relaxed text-center">
            Discover powerful tools and platforms to enhance your workflow. 
            Browse through various categories including development, database, and automation tools.
          </p>
        </div>
        <motion.div 
          className="relative w-full max-w-2xl mx-auto group"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-siso-text/60 w-5 h-5 transition-colors group-focus-within:text-siso-orange" />
          <Input
            placeholder="Search tools..."
            className="pl-12 h-14 bg-siso-text/5 border-siso-text/10 hover:border-siso-text/20 focus-visible:ring-siso-orange transition-all duration-300 text-lg rounded-xl shadow-sm"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}