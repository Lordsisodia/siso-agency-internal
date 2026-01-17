/**
 * Photo Capture Component
 * Clean camera/upload button for food photos with improved accessibility
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
      className="grid grid-cols-2 gap-4 w-full"
    >
      {/* Camera Button */}
      <Button
        onClick={() => cameraInputRef.current?.click()}
        disabled={isUploading}
        className="bg-gradient-to-br from-green-600/30 to-green-700/30 border border-green-500/50 text-green-200 hover:from-green-600/40 hover:to-green-700/40 hover:border-green-400/70 transition-all shadow-lg hover:shadow-green-500/20 h-14 min-h-[56px]"
        aria-label="Take photo of food with camera"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2.5 animate-spin" aria-hidden="true" />
            <span className="font-medium">Analyzing...</span>
          </>
        ) : (
          <>
            <Camera className="h-5 w-5 mr-2.5" aria-hidden="true" />
            <span className="font-medium">Take Photo</span>
          </>
        )}
      </Button>

      {/* Upload Button */}
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="bg-gradient-to-br from-green-600/30 to-green-700/30 border border-green-500/50 text-green-200 hover:from-green-600/40 hover:to-green-700/40 hover:border-green-400/70 transition-all shadow-lg hover:shadow-green-500/20 h-14 min-h-[56px]"
        aria-label="Upload food photo from gallery"
      >
        <Upload className="h-5 w-5 mr-2.5" aria-hidden="true" />
        <span className="font-medium">Upload Photo</span>
      </Button>

      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
        id="diet-camera-input"
        aria-label="Take photo of food with camera"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        id="diet-file-input"
        aria-label="Upload food photo from gallery"
      />
    </motion.div>
  );
};
