
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Plus } from 'lucide-react';
import { safeSupabase } from "@/utils/supabaseHelpers";

interface PointsLogEntry {
  id: string;
  action: string;
  points_earned: number;
  created_at: string;
}

export const PointsHistory = ({ userId }: { userId: string }) => {
  const [pointsLog, setPointsLog] = useState<PointsLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPointsHistory = async () => {
      try {
        const { data, error } = await safeSupabase
          .from('points_log')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        
        // Safe type checking before setting state
        if (data && Array.isArray(data)) {
          // Explicitly map to ensure type safety
          const typedData: PointsLogEntry[] = data.map((item: any) => ({
            id: item.id || '',
            action: item.action || '',
            points_earned: Number(item.points_earned) || 0,
            created_at: item.created_at || new Date().toISOString()
          }));
          setPointsLog(typedData);
        } else {
          console.error('Received invalid data format:', data);
          setPointsLog([]);
        }
      } catch (error) {
        console.error('Error fetching points history:', error);
        setPointsLog([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPointsHistory();
  }, [userId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatAction = (action: string) => {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Card className="bg-black/20 border-siso-text/10">
      <CardHeader>
        <CardTitle className="text-siso-text-bold flex items-center gap-2">
          <History className="w-5 h-5 text-siso-orange" />
          Points History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center justify-between p-3 rounded-lg bg-siso-text/5">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-siso-text/10 rounded"></div>
                  <div className="h-3 w-24 bg-siso-text/10 rounded"></div>
                </div>
                <div className="h-6 w-16 bg-siso-text/10 rounded"></div>
              </div>
            ))}
          </div>
        ) : pointsLog.length > 0 ? (
          <div className="space-y-3">
            {pointsLog.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 rounded-lg bg-siso-text/5 border border-siso-text/10"
              >
                <div>
                  <p className="text-sm font-medium text-siso-text-bold">
                    {formatAction(entry.action)}
                  </p>
                  <p className="text-xs text-siso-text/70">
                    {formatDate(entry.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-siso-red">
                  <Plus className="w-4 h-4" />
                  <span className="font-medium">{entry.points_earned}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-siso-text/70">
            <History className="w-8 h-8 mx-auto mb-2 text-siso-text/40" />
            <p>No points history yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
