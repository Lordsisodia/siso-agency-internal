
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NFTMetadata {
  name: string;
  image: string;
  description?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
}

interface NFTDetailsModalProps {
  nft: NFTMetadata | null;
  isOpen: boolean;
  onClose: () => void;
}

export const NFTDetailsModal = ({ nft, isOpen, onClose }: NFTDetailsModalProps) => {
  if (!nft) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-black/90 border-siso-text/10 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-siso-red to-siso-orange bg-clip-text text-transparent">
            {nft.name}
          </DialogTitle>
        </DialogHeader>
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            className="relative rounded-lg overflow-hidden shadow-2xl"
          >
            <img
              src={nft.image}
              alt={nft.name}
              className="w-full rounded-lg object-cover aspect-square"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
          <ScrollArea className="h-[400px]">
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {nft.description && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-sm font-medium text-siso-text/60 mb-2">Description</h3>
                  <p className="text-siso-text leading-relaxed">{nft.description}</p>
                </motion.div>
              )}
              {nft.attributes && nft.attributes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-sm font-medium text-siso-text/60 mb-3">Attributes</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {nft.attributes.map((attr, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className={cn(
                          "bg-siso-text/5 p-3 rounded-lg border border-siso-text/10",
                          "hover:border-siso-text/20 transition-all duration-300",
                          "backdrop-blur-sm"
                        )}
                      >
                        <div className="text-xs text-siso-text/60 mb-1">{attr.trait_type}</div>
                        <div className="text-sm font-medium text-siso-text-bold">{attr.value}</div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </ScrollArea>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
