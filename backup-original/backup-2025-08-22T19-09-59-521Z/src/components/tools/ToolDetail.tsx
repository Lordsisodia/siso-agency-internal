import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Download, ExternalLink, Heart, Info, Share2, Star, Twitter, Youtube } from 'lucide-react';
import { Tool } from './types';

interface ToolDetailProps {
  tool: Tool;
  onClose: () => void;
}

export function ToolDetail({ tool, onClose }: ToolDetailProps) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: tool.name,
        text: tool.description || `Check out ${tool.name}`,
        url: window.location.href,
      }).catch((error) => console.log('Error sharing:', error));
    }
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`Check out ${tool.name}${tool.description ? `: ${tool.description}` : ''}`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const getYoutubeEmbedUrl = (url: string) => {
    const videoId = url.includes('watch?v=') 
      ? url.split('watch?v=')[1].split('&')[0]
      : url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
  };

  return (
    <Sheet open={true} onOpenChange={() => onClose()}>
      <SheetContent className="bg-siso-bg border-l border-siso-text/10 w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center gap-4">
            {tool.profile_image_url ? (
              <img 
                src={tool.profile_image_url} 
                alt={tool.name}
                className="w-20 h-20 rounded-full object-cover ring-2 ring-siso-orange/20"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-siso-red/20 to-siso-orange/20 flex items-center justify-center ring-2 ring-siso-orange/20">
                <Star className="w-10 h-10 text-siso-orange" />
              </div>
            )}
            <div>
              <SheetTitle className="text-2xl font-bold text-siso-text-bold mb-1">
                {tool.name}
              </SheetTitle>
              {tool.member_type ? (
                <p className="text-sm text-siso-text/80 capitalize">{tool.member_type}</p>
              ) : (
                <p className="text-sm text-siso-text/80">{tool.category}</p>
              )}
            </div>
          </div>
          <SheetDescription className="text-siso-text text-base leading-relaxed">
            {tool.description}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-8">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-siso-text-bold flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-siso-orange" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {tool.website_url && (
                <Button
                  className="w-full justify-start gap-2 bg-gradient-to-r from-siso-red/90 to-siso-orange/90 hover:from-siso-red hover:to-siso-orange transition-all duration-300"
                  onClick={() => window.open(tool.website_url!, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                  Visit Website
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-siso-text/20 hover:bg-siso-text/5"
                onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(tool.name)}`, '_blank')}
              >
                <Info className="h-4 w-4 text-siso-text/80" />
                Learn More
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-siso-text/20 hover:bg-siso-text/5"
                onClick={handleTwitterShare}
              >
                <Twitter className="h-4 w-4 text-blue-400" />
                Share on X
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-siso-text/20 hover:bg-siso-text/5"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 text-siso-text/80" />
                Share
              </Button>
            </div>
          </div>

          {/* Video Section - Always show even if empty */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-siso-text-bold flex items-center gap-2">
              <Youtube className="w-5 h-5 text-red-500" />
              Featured Video
            </h3>
            {tool.youtube_url ? (
              <div className="rounded-lg overflow-hidden bg-black/20 ring-1 ring-siso-text/10">
                <AspectRatio ratio={16 / 9}>
                  <iframe
                    src={getYoutubeEmbedUrl(tool.youtube_url)}
                    title={`${tool.name} video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </AspectRatio>
              </div>
            ) : (
              <div className="rounded-lg overflow-hidden bg-black/20 ring-1 ring-siso-text/10 flex items-center justify-center">
                <AspectRatio ratio={16 / 9}>
                  <div className="w-full h-full flex items-center justify-center text-siso-text/60">
                    <p>No video available</p>
                  </div>
                </AspectRatio>
              </div>
            )}
          </div>

          {tool.specialization && tool.specialization.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-siso-text-bold">Specializations</h3>
              <div className="flex flex-wrap gap-2">
                {tool.specialization.map((spec, index) => (
                  <span 
                    key={index}
                    className="text-sm px-3 py-1 rounded-full bg-siso-text/10 text-siso-text hover:bg-siso-text/20 transition-colors cursor-default"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {tool.content_themes && tool.content_themes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-siso-text-bold">Content Themes</h3>
              <div className="flex flex-wrap gap-2">
                {tool.content_themes.map((theme, index) => (
                  <span 
                    key={index}
                    className="text-sm px-3 py-1 rounded-full bg-siso-orange/10 text-siso-orange hover:bg-siso-orange/20 transition-colors cursor-default"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          {!tool.member_type && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-siso-text-bold">Stats</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-siso-text/5 hover:bg-siso-text/10 transition-colors">
                  <Star className="h-5 w-5 text-siso-orange mx-auto mb-2" />
                  <div className="text-sm font-medium text-siso-text-bold">{tool.rating?.toFixed(1) || '-'}</div>
                  <div className="text-xs text-siso-text">Rating</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-siso-text/5 hover:bg-siso-text/10 transition-colors">
                  <Download className="h-5 w-5 text-siso-text/60 mx-auto mb-2" />
                  <div className="text-sm font-medium text-siso-text-bold">{tool.downloads_count || '0'}</div>
                  <div className="text-xs text-siso-text">Downloads</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-siso-text/5 hover:bg-siso-text/10 transition-colors">
                  <Heart className="h-5 w-5 text-siso-red mx-auto mb-2" />
                  <div className="text-sm font-medium text-siso-text-bold">{tool.likes_count || '0'}</div>
                  <div className="text-xs text-siso-text">Likes</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}