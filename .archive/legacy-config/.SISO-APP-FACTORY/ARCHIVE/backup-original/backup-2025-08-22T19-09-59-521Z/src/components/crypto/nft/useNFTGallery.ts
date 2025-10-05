
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NFT {
  name: string;
  image: string;
  description?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
}

export const useNFTGallery = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [filterAttribute, setFilterAttribute] = useState<string>('all');
  const { toast } = useToast();

  const fetchNFTs = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please sign in to view your NFTs.",
        });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('solana_wallet_address')
        .eq('id', session.user.id)
        .single();

      if (!profile?.solana_wallet_address) {
        toast({
          variant: "destructive",
          title: "Wallet not connected",
          description: "Please connect your Solana wallet to view your NFTs.",
        });
        return;
      }

      const { data: nftData, error } = await supabase.functions.invoke('fetch-solana-nfts', {
        body: { walletAddress: profile.solana_wallet_address }
      });

      if (error) throw error;
      
      const sortedNFTs = [...(nftData || [])].sort((a, b) => {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      });
      
      setNfts(sortedNFTs);
    } catch (error: any) {
      console.error('Error fetching NFTs:', error);
      toast({
        variant: "destructive",
        title: "Error fetching NFTs",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNFTs();
  }, [sortOrder]);

  const getUniqueAttributes = () => {
    const attributes = new Set<string>();
    nfts.forEach(nft => {
      nft.attributes?.forEach(attr => {
        attributes.add(attr.trait_type);
      });
    });
    return Array.from(attributes);
  };

  const filteredNFTs = nfts.filter(nft => {
    if (filterAttribute === 'all') return true;
    return nft.attributes?.some(attr => attr.trait_type === filterAttribute);
  });

  return {
    nfts,
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
  };
};
