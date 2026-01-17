import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, ArrowRight, TrendingUp, TrendingDown, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface Partner {
  rank: number;
  name: string;
  earnings: number;
  trend: string;
  avatar?: string;
}

interface LeaderboardPreviewCardProps {
  partners: Partner[];
  title: string;
  viewAllLink: string;
}

export function LeaderboardPreviewCard({ partners, title, viewAllLink }: LeaderboardPreviewCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <Card className="border-gray-800 bg-black/40 hover:border-siso-orange/30 transition-all duration-300 h-full shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-800/50">
          <CardTitle className="text-lg font-semibold flex items-center text-white">
            <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-2">
            {partners.slice(0, 5).map((partner) => (
              <motion.div
                key={partner.rank}
                whileHover={{ scale: 1.02 }}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  partner.rank === 1 ? 'bg-gradient-to-r from-yellow-500/20 via-yellow-500/10 to-transparent border border-yellow-500/30' :
                  partner.rank === 2 ? 'bg-gradient-to-r from-gray-400/20 via-gray-400/10 to-transparent border border-gray-400/30' :
                  partner.rank === 3 ? 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/30' :
                  'bg-black/30 border border-gray-700/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-inner ${
                    partner.rank === 1 ? 'bg-yellow-500/30 text-yellow-500 font-bold' :
                    partner.rank === 2 ? 'bg-gray-400/30 text-gray-300 font-bold' :
                    partner.rank === 3 ? 'bg-amber-600/30 text-amber-500 font-bold' :
                    'bg-black/50 text-gray-300 border border-gray-700'
                  }`}>
                    {partner.rank}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-medium">{partner.name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-white">${partner.earnings.toLocaleString()}</span>
                  <div className="flex items-center justify-end gap-1 text-xs">
                    {partner.trend.startsWith('+') ? (
                      <TrendingUp className="h-3 w-3 text-green-400" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-400" />
                    )}
                    <span className="text-gray-400">{partner.trend}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full mt-4 bg-black/30 border-siso-orange/30 text-siso-orange hover:bg-siso-orange/10 hover:text-white shadow-md"
            onClick={() => navigate(viewAllLink)}
          >
            View Full Leaderboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
