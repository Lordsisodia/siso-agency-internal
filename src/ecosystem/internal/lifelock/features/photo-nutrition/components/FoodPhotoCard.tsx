/**
 * Food Photo Card Component
 * Displays individual meal photo with AI-analyzed macros
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Clock } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { format } from 'date-fns';
import type { FoodPhoto } from '../types';

interface FoodPhotoCardProps {
  photo: FoodPhoto;
  onDelete?: (id: string) => void;
}

export const FoodPhotoCard: React.FC<FoodPhotoCardProps> = ({
  photo,
  onDelete
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-pink-900/20 border border-pink-600/30 rounded-xl overflow-hidden hover:border-pink-500/50 transition-all"
    >
      {/* Photo */}
      <div className="relative aspect-video bg-pink-950/50">
        <img
          src={photo.photoUrl}
          alt={photo.aiDescription}
          className="w-full h-full object-cover"
        />

        {/* Delete button */}
        {onDelete && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(photo.id)}
            className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 text-white"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}

        {/* Timestamp badge */}
        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
          <Clock className="h-3 w-3 text-pink-300" />
          <span className="text-xs text-pink-200">
            {format(new Date(photo.timestamp), 'h:mm a')}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Description */}
        <p className="text-sm text-pink-200 mb-3 line-clamp-2">
          {photo.aiDescription}
        </p>

        {/* Macros Grid */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-pink-950/50 rounded-lg p-2 text-center border border-pink-600/20">
            <div className="text-xs text-pink-400 mb-1">Calories</div>
            <div className="text-lg font-bold text-pink-100">{photo.calories}</div>
          </div>
          <div className="bg-pink-950/50 rounded-lg p-2 text-center border border-pink-600/20">
            <div className="text-xs text-pink-400 mb-1">Protein</div>
            <div className="text-lg font-bold text-pink-100">{photo.protein}g</div>
          </div>
          <div className="bg-pink-950/50 rounded-lg p-2 text-center border border-pink-600/20">
            <div className="text-xs text-pink-400 mb-1">Carbs</div>
            <div className="text-lg font-bold text-pink-100">{photo.carbs}g</div>
          </div>
          <div className="bg-pink-950/50 rounded-lg p-2 text-center border border-pink-600/20">
            <div className="text-xs text-pink-400 mb-1">Fats</div>
            <div className="text-lg font-bold text-pink-100">{photo.fats}g</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
