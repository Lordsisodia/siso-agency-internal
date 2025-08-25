
import { useQuery } from '@tanstack/react-query';

export const useVideoDetail = (videoId: string) => {
  return useQuery({
    queryKey: ['video', videoId],
    queryFn: async () => {
      // Mock implementation
      return null;
    },
  });
};
