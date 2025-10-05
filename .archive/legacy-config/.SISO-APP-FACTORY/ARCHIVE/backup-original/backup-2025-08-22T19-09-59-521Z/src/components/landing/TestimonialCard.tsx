import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface TestimonialCardProps {
  name: string;
  role: string;
  company: string;
  image: string;
  quote: string;
  linkedinUrl?: string;
  videoUrl?: string;
  audioReview?: boolean;
}

export function TestimonialCard({ 
  name, 
  role, 
  company, 
  image, 
  quote, 
  linkedinUrl, 
  videoUrl,
  audioReview 
}: TestimonialCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContent, setAudioContent] = useState<string | null>(null);

  // [Analysis] Extract video ID from YouTube URL for thumbnail and direct link
  const getYouTubeInfo = (url: string) => {
    const videoId = url.split('embed/')[1]?.split('?')[0];
    return {
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      directUrl: `https://www.youtube.com/watch?v=${videoId}`
    };
  };

  const handlePlayAudio = async () => {
    if (isPlaying) {
      setIsPlaying(false);
      setAudioContent(null);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: quote, voice: 'alloy' }
      });

      if (error) throw error;

      if (data.audioContent) {
        setAudioContent(data.audioContent);
        setIsPlaying(true);
        
        const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
        audio.play();
        
        audio.onended = () => {
          setIsPlaying(false);
          setAudioContent(null);
        };
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    }
  };

  return (
    <div 
      className="group relative p-4 md:p-6 rounded-xl backdrop-blur-sm border border-siso-orange/40 
        bg-black/30 transition-all duration-300 hover:scale-[1.02] hover:border-siso-orange
        touch-manipulation"
    >
      {/* Profile Section - Optimized for touch */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative h-12 w-12 md:h-10 md:w-10 flex-shrink-0">
          <a 
            href={linkedinUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block"
          >
            <img
              src={image}
              alt={name}
              className="h-full w-full rounded-full object-cover border-2 border-siso-orange/40"
              loading="lazy"
            />
          </a>
        </div>
        <div className="text-left min-w-0">
          <h4 className="text-white font-medium text-base md:text-sm truncate">{name}</h4>
          <p className="text-gray-400 text-sm md:text-xs truncate">{role}</p>
          <p className="text-gray-400 text-sm md:text-xs truncate">{company}</p>
        </div>
      </div>

      {/* Quote - Adjusted for mobile readability */}
      <p className="text-gray-300 italic text-base md:text-sm text-left mb-3 line-clamp-4 md:line-clamp-none">{quote}</p>

      {/* Media Section - Optimized for mobile */}
      {videoUrl ? (
        <div className="relative rounded-lg overflow-hidden bg-black/20 aspect-video">
          <a
            href={getYouTubeInfo(videoUrl).directUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full h-full"
          >
            <img
              src={getYouTubeInfo(videoUrl).thumbnailUrl}
              alt="Video thumbnail"
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
          </a>
        </div>
      ) : audioReview ? (
        <div className="mt-4">
          <Button
            variant="outline"
            size="lg"
            className={`w-full flex items-center justify-center gap-2 min-h-[48px] ${
              isPlaying ? 'bg-siso-orange/20' : ''
            }`}
            onClick={handlePlayAudio}
          >
            <Volume2 className="w-5 h-5" />
            {isPlaying ? 'Stop Audio' : 'Play Voice Review'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}