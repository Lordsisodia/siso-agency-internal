
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NFTCard } from './NFTCard';
import { cn } from '@/lib/utils';

interface NFT {
  name: string;
  image: string;
  description?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
}

interface NFTGalleryGridProps {
  loading: boolean;
  filteredNFTs: NFT[];
  viewMode: 'grid' | 'list';
  onRefresh: () => void;
  onSelectNFT: (nft: NFT) => void;
}

export const NFTGalleryGrid = ({
  loading,
  filteredNFTs,
  viewMode,
  onRefresh,
  onSelectNFT,
}: NFTGalleryGridProps) => {
  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div 
          className="flex justify-center p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Loader2 className="h-6 w-6 animate-spin text-siso-red" />
        </motion.div>
      ) : filteredNFTs.length > 0 ? (
        <motion.div 
          className={cn(
            "grid gap-4",
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr'
              : 'grid-cols-1'
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {filteredNFTs.map((nft, index) => (
            <NFTCard
              key={index}
              nft={nft}
              viewMode={viewMode}
              index={index}
              onClick={() => onSelectNFT(nft)}
            />
          ))}
        </motion.div>
      ) : (
        <motion.div 
          className="text-center py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <p className="text-siso-text/60 mb-4">No NFTs found in your wallet</p>
          <Button
            onClick={onRefresh}
            className="bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90"
          >
            Refresh NFTs
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
