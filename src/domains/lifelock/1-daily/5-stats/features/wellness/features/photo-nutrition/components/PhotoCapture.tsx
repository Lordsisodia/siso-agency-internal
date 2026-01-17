/**
 * Photo Capture Component
 * Clean camera/upload button for food photos
 */

import React, { useRef } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface PhotoCaptureProps {
  onPhotoSelect: (file: File) => void;
  isUploading?: boolean;
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  onPhotoSelect,
  isUploading = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onPhotoSelect(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 gap-3 w-full"
    >
      {/* Camera Button */}
      <Button
        onClick={() => cameraInputRef.current?.click()}
        disabled={isUploading}
        className="bg-gradient-to-br from-pink-600/30 to-pink-700/30 border border-pink-500/50 text-pink-200 hover:from-pink-600/40 hover:to-pink-700/40 hover:border-pink-400/70 transition-all shadow-lg hover:shadow-pink-500/20"
        size="lg"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Camera className="h-5 w-5 mr-2" />
            Take Photo
          </>
        )}
      </Button>

      {/* Upload Button */}
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="bg-gradient-to-br from-pink-600/30 to-pink-700/30 border border-pink-500/50 text-pink-200 hover:from-pink-600/40 hover:to-pink-700/40 hover:border-pink-400/70 transition-all shadow-lg hover:shadow-pink-500/20"
        size="lg"
      >
        <Upload className="h-5 w-5 mr-2" />
        Upload Photo
      </Button>

      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </motion.div>
  );
};
