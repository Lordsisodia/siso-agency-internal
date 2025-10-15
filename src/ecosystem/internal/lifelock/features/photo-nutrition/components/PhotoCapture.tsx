/**
 * Photo Capture Component
 * Clean camera/upload button for food photos
 */

import React, { useRef } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
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
      className="flex gap-3"
    >
      {/* Camera Button */}
      <Button
        onClick={() => cameraInputRef.current?.click()}
        disabled={isUploading}
        className="flex-1 bg-pink-600/20 border-2 border-pink-500/40 text-pink-300 hover:bg-pink-600/30 hover:border-pink-500/60 transition-all"
        size="lg"
      >
        {isUploading ? (
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
        ) : (
          <Camera className="h-5 w-5 mr-2" />
        )}
        {isUploading ? 'Analyzing...' : 'Take Photo'}
      </Button>

      {/* Upload Button */}
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="flex-1 bg-pink-600/20 border-2 border-pink-500/40 text-pink-300 hover:bg-pink-600/30 hover:border-pink-500/60 transition-all"
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
