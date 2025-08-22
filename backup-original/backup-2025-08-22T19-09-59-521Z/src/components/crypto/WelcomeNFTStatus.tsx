import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Loader2, Share2, Twitter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Confetti } from '@/components/ui/confetti';
import { safeSupabase } from '@/utils/supabaseHelpers';
import { supabase } from '@/integrations/supabase/client';  
import FeatureFlags from '@/utils/featureFlags';
import { safeCast } from '@/utils/supabaseHelpers';

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  mint_address: string;
}

type NFTStatusType = 'pending' | 'completed' | 'failed';

interface WelcomeNFTStatus {
  status: NFTStatusType;
  error_message?: string;
  metadata?: NFTMetadata;
}

// Type guard to check if metadata has the correct shape
const isValidNFTMetadata = (metadata: any): metadata is NFTMetadata => {
  return (
    metadata &&
    typeof metadata.name === 'string' &&
    typeof metadata.description === 'string' &&
    typeof metadata.image === 'string' &&
    typeof metadata.mint_address === 'string'
  );
};

export const WelcomeNFTStatus = () => {
  const [status, setStatus] = useState<WelcomeNFTStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [rotateY, setRotateY] = useState(0);
  const confettiRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!FeatureFlags.nft) {
      setStatus({ status: 'pending' });
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from('welcome_nft_mints')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (error) throw error;

        // Safely cast and parse the data
        const nftData = safeCast<any>(data);
        
        // Ensure status is one of our allowed types
        const nftStatus: NFTStatusType = ['pending', 'completed', 'failed'].includes(nftData?.status) 
          ? nftData?.status as NFTStatusType 
          : 'pending';

        setStatus({
          status: nftStatus,
          error_message: nftData?.error_message,
          metadata: isValidNFTMetadata(nftData?.metadata) ? nftData.metadata : undefined
        });

        if (nftData?.status === 'completed' && isValidNFTMetadata(nftData.metadata)) {
          confettiRef.current?.fire();
          toast({
            title: "Welcome NFT Minted!",
            description: "Your welcome NFT has been successfully minted.",
          });
        }
      } catch (error: any) {
        console.error('Error fetching welcome NFT status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();

    // Fix the channel subscription and unsubscription
    const channel = supabase
      .channel('welcome-nft-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'welcome_nft_mints',
          filter: `user_id=eq.${supabase.auth.getUser()}`
        },
        (payload) => {
          const newData = safeCast<any>(payload.new);
          
          // Ensure status is one of our allowed types
          const nftStatus: NFTStatusType = ['pending', 'completed', 'failed'].includes(newData?.status) 
            ? newData?.status as NFTStatusType 
            : 'pending';
            
          setStatus({
            status: nftStatus,
            error_message: newData?.error_message,
            metadata: isValidNFTMetadata(newData?.metadata) ? newData.metadata : undefined
          });
          
          if (newData?.status === 'completed' && isValidNFTMetadata(newData?.metadata)) {
            confettiRef.current?.fire();
            toast({
              title: "Welcome NFT Minted!",
              description: "Your welcome NFT has been successfully minted.",
            });
          }
        }
      )
      .subscribe();

    // Return proper cleanup function that actually unsubscribes
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleShare = async () => {
    if (!status?.metadata) return;
    
    const text = `Just minted my Welcome NFT on SISO Resource Hub! 🎉\nCheck out my NFT: ${status.metadata.name}\n#SISOHub #NFT`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Welcome NFT',
          text: text,
          url: window.location.href
        });
      } else {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <Card className="bg-black/20 border-siso-text/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-siso-orange" />
            Welcome NFT
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-siso-orange" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!status) return null;

  return (
    <>
      <Confetti ref={confettiRef} />
      <Card className="bg-black/20 border-siso-text/10 relative overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-siso-orange" />
            Welcome NFT
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {status.status === 'pending' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-siso-text">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Minting your welcome NFT...</span>
                </div>
                <div className="w-full h-2 bg-siso-text/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-siso-red to-siso-orange"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "linear"
                    }}
                  />
                </div>
              </motion.div>
            )}

            {status.status === 'completed' && status.metadata && (
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <motion.div
                  className="relative cursor-pointer perspective-1000"
                  style={{ transform: `rotateY(${rotateY}deg)` }}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const rotateY = ((x / rect.width) - 0.5) * 30;
                    setRotateY(rotateY);
                  }}
                  onMouseLeave={() => setRotateY(0)}
                >
                  <img
                    src={status.metadata.image}
                    alt={status.metadata.name}
                    className="w-full aspect-square rounded-lg object-cover shadow-xl transition-transform duration-300 hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-siso-red/20 to-siso-orange/20 rounded-lg pointer-events-none" />
                </motion.div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-siso-text-bold text-xl">
                    {status.metadata.name}
                  </h3>
                  <p className="text-sm text-siso-text/80">
                    {status.metadata.description}
                  </p>
                  <p className="text-xs text-siso-text/60 font-mono break-all">
                    Mint address: {status.metadata.mint_address}
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleShare}
                    className="flex-1 bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      `Just minted my Welcome NFT on SISO Resource Hub! 🎉\nCheck out my NFT: ${status.metadata.name}\n#SISOHub #NFT`
                    )}`, '_blank')}
                    variant="outline"
                    className="flex-1"
                  >
                    <Twitter className="w-4 h-4 mr-2" />
                    Tweet
                  </Button>
                </div>
              </motion.div>
            )}

            {status.status === 'failed' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500"
              >
                <p>Failed to mint NFT</p>
                {status.error_message && (
                  <p className="text-sm mt-1">{status.error_message}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </>
  );
};
