
import { Card, CardContent } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, PlayCircle, FileImage, Shield, Check, X } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';

interface ClientAppMediaPreviewProps {
  videoUrl?: string;
  wireframeUrls?: string[];
}

export function ClientAppMediaPreview({ videoUrl, wireframeUrls }: ClientAppMediaPreviewProps) {
  return (
    <Card className="bg-black/30 border-siso-text/10">
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">App Preview</h2>
          <div className="flex gap-2">
            <StatusBadge 
              leftIcon={Shield}
              rightIcon={Check}
              leftLabel="Protection"
              rightLabel="Enabled"
              status="success"
            />
            <StatusBadge 
              leftIcon={Check}
              rightIcon={Shield}
              leftLabel="Live"
              rightLabel="Production"
              status="success"
            />
          </div>
        </div>
        
        <Tabs defaultValue="video" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="video" className="flex items-center gap-2">
              <PlayCircle className="h-4 w-4" />
              Demo Video
            </TabsTrigger>
            <TabsTrigger value="wireframes" className="flex items-center gap-2">
              <FileImage className="h-4 w-4" />
              Wireframes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="video">
            {videoUrl ? (
              <AspectRatio ratio={16 / 9} className="bg-black/50 rounded-lg overflow-hidden">
                <iframe
                  src={videoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </AspectRatio>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-black/20 rounded-lg">
                <PlayCircle className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-400">Demo video coming soon</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="wireframes">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wireframeUrls?.map((url, index) => (
                <AspectRatio key={index} ratio={16 / 9} className="bg-black/50 rounded-lg overflow-hidden">
                  <img src={url} alt={`Wireframe ${index + 1}`} className="object-cover" />
                </AspectRatio>
              )) || (
                <div className="flex flex-col items-center justify-center h-64 bg-black/20 rounded-lg">
                  <FileImage className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-400">Wireframes coming soon</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
