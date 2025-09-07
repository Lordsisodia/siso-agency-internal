
import { LoginStreakTracker } from '@/components/points/LoginStreakTracker';
import { PointsDisplay } from '@/components/points/PointsDisplay';
import { ConnectWalletButton } from '@/components/crypto/ConnectWalletButton';
import { MintNFTButton } from '@/components/crypto/MintNFTButton';

interface ProfileMetricsProps {
  userId: string;
  solanaWalletAddress?: string;
}

export const ProfileMetrics = ({ userId, solanaWalletAddress }: ProfileMetricsProps) => {
  return (
    <>
      <div className="md:col-span-3">
        <LoginStreakTracker userId={userId} />
      </div>
      
      <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-black/20 rounded-xl p-6 backdrop-blur-sm border border-siso-text/10 hover:border-siso-orange/50 transition-colors">
          <PointsDisplay userId={userId} />
        </div>
        
        <div className="bg-black/20 rounded-xl p-6 backdrop-blur-sm border border-siso-text/10 hover:border-siso-orange/50 transition-colors">
          <ConnectWalletButton />
        </div>

        {solanaWalletAddress && (
          <div className="bg-black/20 rounded-xl p-6 backdrop-blur-sm border border-siso-text/10 hover:border-siso-orange/50 transition-colors">
            <MintNFTButton />
          </div>
        )}
      </div>
    </>
  );
};
