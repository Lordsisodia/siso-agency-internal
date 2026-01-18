import { Youtube } from 'lucide-react';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Tool } from './types';

interface ToolVideosProps {
  tool: Tool;
  getYoutubeEmbedUrl: (url: string) => string;
}

export function ToolVideos({ tool, getYoutubeEmbedUrl }: ToolVideosProps) {
  if (!tool.youtube_url && (!tool.youtube_videos || tool.youtube_videos.length === 0)) return null;

  return (
    <div className="space-y-8">
      {tool.youtube_url && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-siso-text-bold flex items-center gap-2">
            <Youtube className="w-6 h-6 text-red-500" />
            Featured Video
          </h2>
          <div className="rounded-lg overflow-hidden bg-black/20 ring-1 ring-siso-text/10">
            <AspectRatio ratio={16 / 9}>
              <iframe
                src={getYoutubeEmbedUrl(tool.youtube_url)}
                title={`${tool.name} demo video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </AspectRatio>
          </div>
        </div>
      )}

      {tool.youtube_videos && tool.youtube_videos.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-siso-text-bold">Related Videos</h2>
          <div className="grid grid-cols-1 gap-6">
            {tool.youtube_videos.map((video, index) => (
              <div key={index} className="space-y-3 glow-card">
                <h3 className="text-lg font-medium text-siso-text-bold">{video.title}</h3>
                <div className="rounded-lg overflow-hidden bg-black/20 ring-1 ring-siso-text/10">
                  <AspectRatio ratio={16 / 9}>
                    <iframe
                      src={getYoutubeEmbedUrl(video.url)}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </AspectRatio>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}