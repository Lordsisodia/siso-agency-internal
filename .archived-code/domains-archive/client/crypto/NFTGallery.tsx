
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Grid } from 'lucide-react';
import { motion } from 'framer-motion';
import { NFTDetailsModal } from './NFTDetailsModal';
import { NFTGalleryHeader } from './nft/NFTGalleryHeader';
import { NFTGalleryGrid } from './nft/NFTGalleryGrid';
import { useNFTGallery } from './nft/useNFTGallery';

// [Analysis] Split into smaller components for better maintainability and reusability
export const NFTGallery = () => {
  const {
    loading,
    viewMode,
    setViewMode,
    sortOrder,
    setSortOrder,
    selectedNFT,
    setSelectedNFT,
    filterAttribute,
    setFilterAttribute,
    filteredNFTs,
    fetchNFTs,
    getUniqueAttributes,
  } = useNFTGallery();

  return (
    <Card className="bg-black/20 border-siso-text/10 backdrop-blur-sm">
      <CardHeader className="space-y-4">
        <CardTitle className="text-siso-text-bold flex items-center gap-2">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2"
          >
            <Grid className="h-6 w-6 text-siso-orange" />
            Your NFT Collection
          </motion.div>
        </CardTitle>
        <NFTGalleryHeader
          viewMode={viewMode}
          setViewMode={setViewMode}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          filterAttribute={filterAttribute}
          setFilterAttribute={setFilterAttribute}
          uniqueAttributes={getUniqueAttributes()}
        />
      </CardHeader>
      <CardContent>
        <NFTGalleryGrid
          loading={loading}
          filteredNFTs={filteredNFTs}
          viewMode={viewMode}
          onRefresh={fetchNFTs}
          onSelectNFT={setSelectedNFT}
        />
      </CardContent>
      <NFTDetailsModal
        nft={selectedNFT}
        isOpen={!!selectedNFT}
        onClose={() => setSelectedNFT(null)}
      />
    </Card>
  );
};
