import { useNavigate } from 'react-router-dom';
import { Tool } from './types';
import { motion } from 'framer-motion';
import { 
  Star, 
  Code, 
  Database, 
  Bot, 
  Workflow, 
  Paintbrush, 
  Wrench,
  Brain,
  Cloud,
  Terminal,
  Table,
  Blocks,
  Rabbit,
  Heart,
  Share2
} from 'lucide-react';

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/tools/${tool.id}`);
  };

  const getIconForTool = (tool: Tool) => {
    // First check specific tools
    switch (tool.name.toLowerCase()) {
      case 'supabase':
        return <Database className="h-6 w-6 text-emerald-500" />;
      case 'firebase':
        return <Database className="h-6 w-6 text-amber-500" />;
      case 'elevenlabs':
        return <Bot className="h-6 w-6 text-blue-500" />;
      case 'huggingface':
        return <Brain className="h-6 w-6 text-yellow-500" />;
      case 'gcp':
        return <Cloud className="h-6 w-6 text-blue-400" />;
      case 'cursor ai':
        return <Terminal className="h-6 w-6 text-purple-500" />;
      case 'airtable':
        return <Table className="h-6 w-6 text-teal-500" />;
      case 'n8n':
        return <Workflow className="h-6 w-6 text-green-500" />;
      case 'make.com':
        return <Blocks className="h-6 w-6 text-indigo-500" />;
      case 'anthropic':
        return <Brain className="h-6 w-6 text-pink-500" />;
      case 'framer':
        return <Paintbrush className="h-6 w-6 text-blue-600" />;
      case 'midjourney':
        return <Paintbrush className="h-6 w-6 text-indigo-600" />;
      case 'runpod':
        return <Cloud className="h-6 w-6 text-purple-600" />;
      case 'replicate':
        return <Share2 className="h-6 w-6 text-gray-500" />;
      case 'rabbit':
        return <Rabbit className="h-6 w-6 text-orange-500" />;
      case 'perplexity':
        return <Brain className="h-6 w-6 text-blue-500" />;
      case 'together ai':
        return <Heart className="h-6 w-6 text-red-500" />;
    }

    // Then fall back to category-based icons
    switch (tool.category?.toLowerCase()) {
      case 'development':
        return <Code className="h-6 w-6 text-blue-500" />;
      case 'database':
        return <Database className="h-6 w-6 text-green-500" />;
      case 'gpt builder':
        return <Bot className="h-6 w-6 text-purple-500" />;
      case 'automation':
        return <Workflow className="h-6 w-6 text-orange-500" />;
      case 'visual':
        return <Paintbrush className="h-6 w-6 text-pink-500" />;
      default:
        return <Wrench className="h-6 w-6 text-siso-orange" />;
    }
  };

  return (
    <motion.div
      onClick={handleClick}
      className="group relative flex flex-col gap-4 rounded-lg border border-siso-text/10 bg-siso-text/5 p-6 transition-all duration-300 cursor-pointer h-[200px] hover:border-siso-orange/30 focus:outline-none focus:ring-2 focus:ring-siso-orange/50 shadow-sm backdrop-blur-sm"
      whileHover={{ 
        scale: 1.02,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${tool.name}`}
    >
      <div className="flex items-start gap-4">
        {tool.profile_image_url ? (
          <img
            src={tool.profile_image_url}
            alt={`${tool.name} logo`}
            className="h-12 w-12 shrink-0 rounded-lg object-cover ring-2 ring-siso-orange/20 transition-all duration-300 group-hover:ring-siso-orange/40"
            loading="lazy"
          />
        ) : (
          <div className="h-12 w-12 shrink-0 rounded-lg bg-gradient-to-br from-siso-red/20 to-siso-orange/20 flex items-center justify-center ring-2 ring-siso-orange/20 transition-all duration-300 group-hover:ring-siso-orange/40">
            {getIconForTool(tool)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-siso-text-bold group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-siso-red group-hover:to-siso-orange transition-all duration-300 truncate">
            {tool.name}
          </h3>
          <p className="text-sm text-siso-text/80 truncate">{tool.category}</p>
          {tool.rating && (
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm text-siso-text/80">{tool.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
      {tool.description && (
        <p className="text-sm text-siso-text/80 line-clamp-2 leading-relaxed mt-auto group-hover:text-siso-text/90 transition-colors duration-300">
          {tool.description}
        </p>
      )}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-siso-red/0 via-siso-orange/0 to-siso-red/0 transform origin-left"
        whileHover={{
          scaleX: 1,
          background: 'linear-gradient(to right, var(--siso-red), var(--siso-orange), var(--siso-red))',
        }}
        initial={{ scaleX: 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}