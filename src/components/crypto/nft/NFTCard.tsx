
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NFTCardProps {
  nft: {
    name: string;
    image: string;
    description?: string;
    attributes?: Array<{ trait_type: string; value: string }>;
  };
  viewMode: 'grid' | 'list';
  index: number;
  onClick: () => void;
}

export const NFTCard = ({ nft, viewMode, index, onClick }: NFTCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <div 
        className={cn(
          "bg-background/50 cursor-pointer h-full",
          "hover:bg-background/60 transition-all duration-300",
          "border border-siso-text/10 hover:border-siso-text/20",
          "backdrop-blur-sm shadow-lg hover:shadow-xl rounded-lg"
        )}
        onClick={onClick}
      >
        <div className={cn(
          "p-4",
          viewMode === 'list' ? 'flex items-center gap-4' : ''
        )}>
          <motion.div 
            className={cn(
              "relative overflow-hidden rounded-lg",
              viewMode === 'list' ? 'w-24 h-24' : 'w-full aspect-square'
            )}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <img
              src={nft.image}
              alt={nft.name}
              className="w-full h-full object-cover transform transition-transform duration-300"
            />
          </motion.div>
          <div className="flex-1 mt-4">
            <h3 className="font-semibold text-siso-text-bold text-lg">{nft.name}</h3>
            {nft.description && viewMode === 'list' && (
              <p className="text-sm text-siso-text/80 mt-1 line-clamp-2">
                {nft.description}
              </p>
            )}
            {nft.attributes && nft.attributes.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {nft.attributes.slice(0, 3).map((attr, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-xs rounded-full bg-siso-text/10 text-siso-text/80"
                  >
                    {attr.trait_type}: {attr.value}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
