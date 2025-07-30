
import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { PointsExchange } from '@/components/crypto/PointsExchange';
import { NFTGallery } from '@/components/crypto/NFTGallery';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const Crypto = () => {
  const [userPoints, setUserPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Instead of database query, use mock data
    const fetchUserPoints = async () => {
      try {
        // Mock authentication/session check
        const isAuthenticated = true;
        
        if (!isAuthenticated) {
          setLoading(false);
          return;
        }

        // Set mock points
        const mockPoints = 500;
        setUserPoints(mockPoints);
      } catch (error: any) {
        console.error('Error fetching user points:', error);
        toast({
          variant: "destructive",
          title: "Error fetching points",
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserPoints();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-siso-red" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 p-4 md:p-6 lg:p-8 max-h-screen overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <PointsExchange userPoints={userPoints} />
            <NFTGallery />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Crypto;
