import { useEffect, useState } from 'react';
import { ArrowRightLeft, Loader2, Wifi, Database, History, Filter } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PointsExchange } from "@/components/crypto/PointsExchange";
import { NFTGallery } from "@/components/crypto/NFTGallery";
import { WelcomeNFTStatus } from "@/components/crypto/WelcomeNFTStatus";
import { useToast } from '@/hooks/use-toast';
import { Sidebar } from '@/components/Sidebar';
import { FloatingOrbs } from '@/components/effects/FloatingOrbs';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <motion.div 
      className="flex items-center gap-2 text-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Wifi className={`h-4 w-4 ${isOnline ? 'text-green-500' : 'text-red-500'}`} />
      <span className="text-siso-text/80">
        {isOnline ? 'Connected' : 'Offline'}
      </span>
      <Database className="h-4 w-4 text-siso-orange ml-2" />
      <span className="text-siso-text/80">Solana Network</span>
    </motion.div>
  );
};

const TransactionHistory = () => {
  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-siso-text/60" />
            <span className="text-sm font-medium">Filter Transactions</span>
          </div>
          <Button variant="ghost" size="sm" className="text-xs">
            Clear All
          </Button>
        </div>
        <div className="space-y-2">
          <div className="bg-black/20 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-siso-text">Points Exchange</span>
              <span className="text-xs text-siso-text/60">2 min ago</span>
            </div>
            <p className="text-xs text-siso-text/80 mt-1">Converted 1000 points to SISO tokens</p>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

const CryptoExchange = () => {
  const [userPoints, setUserPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Use mock data instead of database query
    const fetchUserPoints = async () => {
      try {
        // Mock authentication check
        const isAuthenticated = true;
        
        if (!isAuthenticated) {
          toast({
            variant: "destructive",
            title: "Authentication required",
            description: "Please sign in to access this page.",
          });
          setLoading(false);
          return;
        }

        // Set mock points
        const mockPoints = 750;
        setUserPoints(mockPoints);
      } catch (error: any) {
        console.error('Error fetching user points:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load user points. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserPoints();
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-6 w-6 animate-spin text-siso-red" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="relative overflow-hidden">
        <FloatingOrbs />
        
        <motion.div 
          className="container mx-auto p-6 space-y-8 relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="flex flex-col space-y-4 bg-black/20 p-6 rounded-lg backdrop-blur-sm border border-siso-text/5 hover:border-siso-text/10 transition-all duration-300"
            variants={cardVariants}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <ArrowRightLeft className="w-8 h-8 text-gradient bg-gradient-to-r from-siso-red to-siso-orange" />
                </motion.div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-siso-red to-siso-orange bg-clip-text text-transparent">
                  Crypto Exchange
                </h1>
              </div>
              <NetworkStatus />
            </div>
            <p className="text-siso-text/80 ml-11">
              Convert your SISO Points to SISO Tokens and manage your NFTs
            </p>
            <div className="flex items-center justify-between ml-11">
              <div className="flex items-center gap-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 hover:border-siso-text/20 hover:bg-black/40 transition-all duration-300">
                      <History className="h-4 w-4" />
                      Transaction History
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Transaction History</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4">
                      <TransactionHistory />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div 
              className="flex flex-col space-y-4"
              variants={cardVariants}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-siso-text-bold">
                  Swap Your Points
                </h2>
                <div className="text-sm text-siso-text/60">
                  Balance: {userPoints.toLocaleString()} Points
                </div>
              </div>
              <motion.div 
                className="bg-black/40 backdrop-blur-lg rounded-xl border border-siso-text/10 p-6 hover:border-siso-text/20 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-siso-red/5"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <PointsExchange userPoints={userPoints} />
              </motion.div>
              
              <WelcomeNFTStatus />
            </motion.div>

            <motion.div 
              className="flex flex-col space-y-4"
              variants={cardVariants}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-siso-text-bold">
                  Your NFT Gallery
                </h2>
                <div className="text-sm text-siso-text/60">
                  Connected to Solana
                </div>
              </div>
              <motion.div 
                className="bg-black/40 backdrop-blur-lg rounded-xl border border-siso-text/10 p-6 hover:border-siso-text/20 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-siso-orange/5"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <NFTGallery />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default CryptoExchange;
