
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ImageOff } from "lucide-react";

interface TabImageProps {
  src?: string;
  alt?: string;
}

export const TabImage = ({ src, alt }: TabImageProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [src]);

  const handleImageLoad = () => {
    console.log('[TabImage] Image loaded successfully:', src);
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.target as HTMLImageElement;
    console.error('[TabImage] Image failed to load:', {
      src: img.src,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      error: e
    });
    setImageLoaded(false);
    setImageError(true);
  };

  return (
    <div className="relative h-[400px] rounded-xl overflow-hidden bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm border border-siso-orange/20 shadow-lg shadow-siso-orange/5">
      {!imageError ? (
        <>
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-siso-orange border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-radial from-siso-orange/10 via-transparent to-transparent opacity-30" />
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img
              src={src}
              alt={alt}
              className={`max-w-full max-h-full w-auto h-auto object-contain rounded-lg transition-all duration-300 hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{ 
                maxHeight: '380px',
              }}
            />
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <ImageOff className="w-12 h-12 text-siso-orange mb-2" />
          <p className="text-sm text-siso-text/70">Unable to load image</p>
          <p className="text-xs text-siso-text/50 mt-1">{src}</p>
        </div>
      )}
    </div>
  );
};
