
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useVideoProcessing = () => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Trigger manual processing of a video
  const processVideo = async (videoId: string) => {
    try {
      setProcessing(true);
      setError(null);
      
      console.log(`Trigger would process video: ${videoId}`);
      
      // Mock successful processing
      setTimeout(() => {
        toast({
          title: "Processing Completed",
          description: `Successfully processed video: ${videoId}`,
        });
      }, 1000);
      
      return { success: true, title: `Video ${videoId}` };
    } catch (err) {
      console.error('Error processing video:', err);
      setError(err as Error);
      
      toast({
        variant: "destructive",
        title: "Processing Failed",
        description: err instanceof Error ? err.message : 'An unknown error occurred',
      });
      
      throw err;
    } finally {
      setProcessing(false);
    }
  };

  // Get pending videos that need processing
  const getPendingVideos = async () => {
    try {
      setError(null);
      
      // Return mock data for pending videos
      return [
        { 
          id: 'mock-1', 
          video_id: 'abc123', 
          status: 'pending', 
          created_at: new Date().toISOString() 
        }
      ];
    } catch (err) {
      console.error('Error fetching pending videos:', err);
      setError(err as Error);
      
      toast({
        variant: "destructive",
        title: "Fetch Failed",
        description: 'Failed to fetch pending videos',
      });
      
      return [];
    }
  };

  // Get the processing status of a video
  const getVideoStatus = async (videoId: string) => {
    try {
      setError(null);
      
      // Return mock video status
      return {
        id: 'mock-status',
        video_id: videoId,
        status: 'completed',
        created_at: new Date().toISOString()
      };
    } catch (err) {
      console.error('Error fetching video status:', err);
      setError(err as Error);
      return null;
    }
  };

  return {
    processing,
    error,
    processVideo,
    getPendingVideos,
    getVideoStatus
  };
};
