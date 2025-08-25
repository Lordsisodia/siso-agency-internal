import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Sparkles } from 'lucide-react';

export const MintNFTButton = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleMint = async () => {
    try {
      setLoading(true);
      console.log("[Mint] Starting NFT minting process");

      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      if (!session) {
        throw new Error("Please sign in to mint NFTs");
      }

      // Check if Phantom wallet is connected
      const { solana } = window as any;
      if (!solana?.isPhantom) {
        throw new Error("Please connect Phantom Wallet first");
      }

      // Get connected wallet
      const response = await solana.connect();
      const publicKey = response.publicKey.toString();

      // Prepare metadata
      const metadata = {
        name: "SISO Member NFT",
        description: "Exclusive membership NFT for SISO Resource Hub",
        uri: "https://your-metadata-uri.json", // Replace with actual metadata URI
      };

      console.log("[Mint] Calling mint-nft function");

      // Call minting edge function
      const { data, error } = await supabase.functions.invoke('mint-nft', {
        body: {
          userPublicKey: publicKey,
          nftMetadata: metadata,
          userId: session.user.id
        }
      });

      if (error) throw error;

      console.log("[Mint] NFT minted successfully:", data);

      toast({
        title: "Success!",
        description: "NFT minted successfully",
      });

    } catch (error: any) {
      console.error("[Mint] Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to mint NFT",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleMint} 
      disabled={loading}
      className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 transition-colors duration-300 hover:scale-105"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Minting...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Mint SISO NFT
        </>
      )}
    </Button>
  );
};