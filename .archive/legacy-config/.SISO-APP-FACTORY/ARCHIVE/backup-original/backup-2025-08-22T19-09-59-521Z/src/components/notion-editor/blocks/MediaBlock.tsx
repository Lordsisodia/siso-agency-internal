import React, { useState, useRef } from 'react';
import { NotionBlock } from '@/types/notion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Upload, 
  Image as ImageIcon, 
  Video, 
  Link, 
  X, 
  Edit3,
  Download,
  ExternalLink
} from 'lucide-react';

interface MediaBlockProps {
  block: NotionBlock;
  isEditing?: boolean;
  onContentChange?: (blockId: string, content: string) => void;
  onBlockUpdate?: (blockId: string, properties: any) => void;
}

export const MediaBlock: React.FC<MediaBlockProps> = ({
  block,
  isEditing = false,
  onContentChange,
  onBlockUpdate
}) => {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [tempUrl, setTempUrl] = useState('');
  const [editingCaption, setEditingCaption] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const url = block.properties?.url || '';
  const caption = block.properties?.caption || '';
  const width = block.properties?.width;
  const height = block.properties?.height;

  const updateProperties = (updates: any) => {
    if (onBlockUpdate) {
      onBlockUpdate(block.id, {
        ...block.properties,
        ...updates
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real implementation, this would upload to Supabase Storage
      // For now, we'll create a local URL
      const objectUrl = URL.createObjectURL(file);
      updateProperties({ url: objectUrl, caption: file.name });
    }
  };

  const handleUrlSubmit = () => {
    if (tempUrl.trim()) {
      updateProperties({ url: tempUrl.trim() });
      setTempUrl('');
      setShowUrlInput(false);
    }
  };

  const isVideoUrl = (url: string) => {
    return /\.(mp4|webm|ogg|mov)$/i.test(url) || 
           url.includes('youtube.com') || 
           url.includes('vimeo.com') ||
           url.includes('youtu.be');
  };

  const getEmbedUrl = (url: string) => {
    // Convert YouTube URLs to embed format
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Convert Vimeo URLs to embed format
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  const renderMedia = () => {
    if (!url) {
      return (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            {block.type === 'image' ? (
              <ImageIcon className="w-12 h-12 text-gray-400" />
            ) : (
              <Video className="w-12 h-12 text-gray-400" />
            )}
            
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-400">
                Add {block.type === 'image' ? 'an image' : 'a video'}
              </p>
              
              {isEditing && (
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload file
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUrlInput(true)}
                  >
                    <Link className="w-4 h-4 mr-2" />
                    Add URL
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept={block.type === 'image' ? 'image/*' : 'video/*'}
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      );
    }

    const isVideo = isVideoUrl(url);
    const isEmbed = url.includes('youtube.com') || url.includes('vimeo.com') || url.includes('youtu.be');

    return (
      <div className="relative group">
        {isEmbed ? (
          <div className="relative w-full h-0 pb-[56.25%] rounded-lg overflow-hidden">
            <iframe
              src={getEmbedUrl(url)}
              className="absolute top-0 left-0 w-full h-full"
              frameBorder="0"
              allowFullScreen
              title="Embedded video"
            />
          </div>
        ) : isVideo ? (
          <video
            src={url}
            controls
            className="w-full max-w-full h-auto rounded-lg"
            style={{ width: width || 'auto', height: height || 'auto' }}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src={url}
            alt={caption || 'Uploaded image'}
            className="max-w-full h-auto rounded-lg"
            style={{ width: width || 'auto', height: height || 'auto' }}
            onError={(e) => {
              e.currentTarget.src = '/api/placeholder/400/300';
            }}
          />
        )}
        
        {/* Edit overlay */}
        {isEditing && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex space-x-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowUrlInput(true)}
                className="h-8 w-8 p-0"
              >
                <Link className="w-3 h-3" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => updateProperties({ url: '' })}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="notion-media-block my-4">
      {renderMedia()}
      
      {/* Caption */}
      {(caption || isEditing) && (
        <div className="mt-2">
          {editingCaption && isEditing ? (
            <Input
              value={caption}
              onChange={(e) => updateProperties({ caption: e.target.value })}
              onBlur={() => setEditingCaption(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') {
                  setEditingCaption(false);
                }
              }}
              placeholder="Add a caption..."
              className="text-sm text-center"
              autoFocus
            />
          ) : (
            <p 
              className={`text-sm text-gray-600 dark:text-gray-400 text-center ${
                isEditing ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-2 py-1' : ''
              }`}
              onClick={() => isEditing && setEditingCaption(true)}
            >
              {caption || (isEditing ? 'Click to add caption...' : '')}
            </p>
          )}
        </div>
      )}

      {/* URL Input Modal */}
      {showUrlInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
              Add {block.type === 'image' ? 'Image' : 'Video'} URL
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="media-url">URL</Label>
                <Input
                  id="media-url"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  placeholder={`Enter ${block.type} URL...`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUrlSubmit();
                    }
                  }}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUrlInput(false);
                    setTempUrl('');
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleUrlSubmit}>
                  Add {block.type === 'image' ? 'Image' : 'Video'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 