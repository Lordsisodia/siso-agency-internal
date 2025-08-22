
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Diamond } from 'lucide-react';
import { safeSupabase } from "@/utils/supabaseHelpers";

interface NFTCollection {
  name: string;
  image_url?: string | null;
  tier?: string | null;
  points_multiplier?: number | null;
  weekly_bonus?: number | null;
}

interface UserNFTData {
  id: string;
  nft_collections: NFTCollection | null;
}

interface NFT {
  id: string;
  name: string;
  imageUrl?: string;
  tier?: string;
  points_multiplier?: number;
  weekly_bonus?: number;
}

interface NFTStatusProps {
  nfts: NFT[];
}

export const NFTStatus = ({ nfts }: NFTStatusProps) => {
  const [userNfts, setUserNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserNFTs = async () => {
      try {
        const { data: { user } } = await safeSupabase.auth.getUser();
        if (!user) return;

        const { data, error } = await safeSupabase
          .from('user_nfts')
          .select(`
            id,
            nft_collections (
              name,
              image_url,
              tier,
              points_multiplier,
              weekly_bonus
            )
          `)
          .eq('user_id', user.id);

        if (error) throw error;

        // First cast to unknown, then to our expected type
        const typedData = (data as unknown) as UserNFTData[];
        
        const transformedNfts = typedData?.map(nft => ({
          id: nft.id,
          name: nft.nft_collections?.name || 'Unknown NFT',
          imageUrl: nft.nft_collections?.image_url || undefined,
          tier: nft.nft_collections?.tier || undefined,
          points_multiplier: nft.nft_collections?.points_multiplier || undefined,
          weekly_bonus: nft.nft_collections?.weekly_bonus || undefined
        })) || [];

        setUserNfts(transformedNfts);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserNFTs();
  }, []);

  return (
    <Card className="bg-black/20 border-siso-text/10">
      <CardHeader>
        <CardTitle className="text-siso-text-bold flex items-center gap-2">
          <Diamond className="w-5 h-5 text-siso-orange" />
          NFT Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-siso-text/5 rounded-lg mb-2"></div>
                <div className="h-4 bg-siso-text/5 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-siso-text/5 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : userNfts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userNfts.map((nft) => (
              <div
                key={nft.id}
                className="p-4 rounded-lg bg-siso-text/5 border border-siso-text/10 hover:border-siso-text/20 transition-all duration-300"
              >
                {nft.imageUrl && (
                  <img
                    src={nft.imageUrl}
                    alt={nft.name}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                )}
                <p className="text-sm font-medium text-siso-text-bold mb-1">{nft.name}</p>
                {nft.tier && (
                  <p className="text-xs text-siso-orange mb-1">Tier: {nft.tier}</p>
                )}
                {nft.points_multiplier && (
                  <p className="text-xs text-siso-text/70">Points Multiplier: {nft.points_multiplier}x</p>
                )}
                {nft.weekly_bonus && (
                  <p className="text-xs text-siso-text/70">Weekly Bonus: +{nft.weekly_bonus} points</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-siso-text/70">
            <Diamond className="w-8 h-8 mx-auto mb-2 text-siso-text/40" />
            <p>No NFTs connected yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
