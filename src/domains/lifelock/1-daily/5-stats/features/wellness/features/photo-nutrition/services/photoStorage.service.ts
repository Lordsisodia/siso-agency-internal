/**
 * Photo Storage Service
 * Handles uploading food photos to Supabase Storage
 */

import { supabase } from '@/lib/services/supabase/client';
import type { PhotoUploadResult } from '../types';

export class PhotoStorageService {
  private bucket = 'food-photos';

  /**
   * Upload food photo to Supabase Storage
   */
  async uploadPhoto(
    userId: string,
    date: string, // YYYY-MM-DD
    file: File
  ): Promise<PhotoUploadResult> {
    try {
      console.log('📤 [STORAGE] Uploading photo...', { userId, date, fileName: file.name });

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${userId}/${date}/${timestamp}-${file.name}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.bucket)
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ [STORAGE] Upload failed:', error);
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.bucket)
        .getPublicUrl(data.path);

      console.log('✅ [STORAGE] Photo uploaded:', urlData.publicUrl);

      return {
        success: true,
        photoUrl: urlData.publicUrl
      };

    } catch (error) {
      console.error('❌ [STORAGE] Error uploading photo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Delete photo from storage
   */
  async deletePhoto(photoUrl: string): Promise<boolean> {
    try {
      // Extract path from URL
      const path = photoUrl.split('/storage/v1/object/public/food-photos/')[1];

      if (!path) {
        throw new Error('Invalid photo URL');
      }

      const { error } = await supabase.storage
        .from(this.bucket)
        .remove([path]);

      if (error) throw error;

      console.log('✅ [STORAGE] Photo deleted');
      return true;

    } catch (error) {
      console.error('❌ [STORAGE] Error deleting photo:', error);
      return false;
    }
  }
}

export const photoStorageService = new PhotoStorageService();
